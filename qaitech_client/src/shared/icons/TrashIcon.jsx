export const TrashIcon = ({ onClick = () => {}, style = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    onClick={onClick}
    className={`min-w-[16px] min-h-[16px] group cursor-pointer ${style}`}
  >
    <path
      className="fill-accent-purple group-hover:fill-accent-dark_purple transition-colors duration-[250ms]"
      d="M10.125 2.25h-2.25v-.563A.938.938 0 0 0 6.937.75H5.063a.937.937 0 0 0-.937.938v.562h-2.25a.375.375 0 0 0 0 .75h.398l.446 7.146c.033.63.516 1.104 1.125 1.104h4.312c.612 0 1.085-.463 1.125-1.101L9.726 3h.399a.375.375 0 0 0 0-.75Zm-5.612 7.5H4.5a.375.375 0 0 1-.375-.361l-.188-5.25a.375.375 0 1 1 .75-.027l.188 5.25a.375.375 0 0 1-.362.388Zm1.862-.375a.375.375 0 0 1-.75 0v-5.25a.375.375 0 0 1 .75 0v5.25Zm.75-7.125h-2.25v-.563a.185.185 0 0 1 .188-.187h1.875a.185.185 0 0 1 .187.188v.562Zm.75 7.139a.375.375 0 0 1-.375.361h-.013a.375.375 0 0 1-.362-.389l.188-5.25a.375.375 0 1 1 .75.027l-.188 5.25Z"
    />
  </svg>
);
