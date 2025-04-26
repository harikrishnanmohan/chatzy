import { useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase.ts";
import chat1 from "../asset/chat1.svg";
import chat2 from "../asset/chat2.svg";
import chat3 from "../asset/chat3.svg";
import google from "../asset/google.svg";
import Button from "../atom/Button";
import Input from "../atom/Input";
import UserContext from "../context/user-context.tsx";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "../atom/ErrorMEssage.tsx";
import Loader from "../atom/Loader.tsx";

const Login = () => {
  const images = [chat1, chat2, chat3];
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [newUser, setNewUser] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const navigate = useNavigate();

  const userCtx = useContext(UserContext);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);

      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFadeIn(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRegister = async () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const firstName = firstNameRef.current?.value;
    const lastName = lastNameRef.current?.value;

    if (newUser && firstName && lastName && email && password) {
      setIsLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;

        if (user) {
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            userId: user.uid,
            avatarBase64: "",
            about: "",
          });
          userCtx?.updateUser({
            firstName: firstName,
            lastName: lastName,
            email: email,
            userId: user.uid,
            avatarBase64: "",
            about: "",
          });
          navigate("/chatzy");
          emailRef.current!.value = "";
          passwordRef.current!.value = "";
          firstNameRef.current!.value = "";
          lastNameRef.current!.value = "";
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    } else if (newUser && (!firstName || !lastName || email || password)) {
      setErrorText("Please fill in all fields.!");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      console.error("Please fill in all fields.");
      return;
    } else if (!newUser && email && password) {
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);

        const docRef = doc(db, "users", auth.currentUser!.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();

          userCtx?.updateUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            userId: userData.userId,
            avatarBase64: userData.avatarBase64,
            about: userData.about,
          });
          navigate("/chatzy");
        } else {
          console.log("No such document!");
        }
        emailRef.current!.value = "";
        passwordRef.current!.value = "";
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    } else {
      setErrorText("Email and Password are required!");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      console.error("Please fill in all fields.");
      return;
    }
  };

  return (
    <div className="w-full h-svh flex items-center justify-center bg-primary text-textPrimary">
      <div className="p-2 md:m-auto flex justify-between items-center bg-[#0e0e0e] rounded-2xl shadow-xl md:max-w-[800px] w-full m-3">
        <div className="w-1/2 h-[550px] bg-[#131313] rounded-2xl overflow-hidden shadow-lg md:flex items-center justify-center hidden">
          <img
            src={images[activeIndex]}
            alt="slideshow"
            className={`w-full h-full object-contain p-10 transition-opacity duration-[1500ms] ease-in-out ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <div className="flex flex-col w-full md:w-1/2 gap-5 p-12 items-center max-w-[400px]">
          <h1 className="text-3xl font-bold  mb-4">
            {newUser ? "Create Account" : "Welcome Back"}
          </h1>
          {newUser && (
            <div className="flex gap-5 w-full">
              <Input
                type="text"
                placeholder="First name"
                ref={firstNameRef}
                className="bg-[#121212] rounded-lg w-[60%]"
              />
              <Input
                type="text"
                placeholder="Last name"
                ref={lastNameRef}
                className="bg-[#121212] rounded-lg w-[40%]"
              />
            </div>
          )}
          <Input
            type="email"
            placeholder="Email Address"
            ref={emailRef}
            className="bg-[#121212] rounded-lg"
          />
          <Input
            type="password"
            placeholder="Password"
            ref={passwordRef}
            className="bg-[#121212] rounded-lg"
            onEnter={handleRegister}
          />

          <div className="flex flex-col gap-3 w-full items-center">
            <Button
              label={!isLoading ? (newUser ? "Sign Up" : "Sign In") : ""}
              children={isLoading && <Loader />}
              className="bg-[#5247e6] hover:bg-[#4644e2] transition-all duration-300 w-full p-2 rounded-lg"
              onClick={handleRegister}
            />

            {!newUser && (
              <Button
                label="Forgot Password?"
                className="text-xs text-gray-400 "
              />
            )}

            <div className="flex items-center gap-2 w-full my-4">
              <div className="h-px flex-1 bg-gray-600 w-full" />
              <span className="text-sm text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-600" />
            </div>

            <Button
              label="Continue with Google"
              icon={google}
              className="bg-[#121212] p-2 w-full rounded-lg flex-row-reverse border-[1px] border-[#242424] text-sm"
              iconClass="w-4 h-4"
            />
          </div>

          <p className="text-sm text-gray-400 mt-2 flex gap-2">
            {newUser ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button
              onClick={() => setNewUser((prev) => !prev)}
              className="text-blue-400 hover:underline ml-1"
              label={newUser ? "Sign in" : "Sign up"}
            />
          </p>
        </div>
      </div>
      <ErrorMessage message={errorText} show={showError} />
    </div>
  );
};

export default Login;
