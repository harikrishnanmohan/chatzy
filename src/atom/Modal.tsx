type ModalProps = {
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
};
const Modal = ({ header, body, footer }: ModalProps) => {
  return (
    <div className="w-full h-full bg-black/90 absolute z-10 top-0 flex flex-col justify-between">
      <div className="self-end">{header}</div>
      <div className="self-center">{body}</div>
      <div className="rounded-lg m-3">{footer}</div>
    </div>
  );
};
export default Modal;
