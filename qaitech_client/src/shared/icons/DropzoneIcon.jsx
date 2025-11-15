const DropzoneIcon = ({ accepted = false, color = "#cbcbcb" }) => {
  return (
    <>
      {accepted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={46}
          height={46}
          className="mx-auto"
          viewBox="0 0 512 512"
        >
          <path
            fill={color}
            d="m199.066 456-7.379-7.514-3.94-3.9-86.2-86.2.053-.055-83.664-83.666 97.614-97.613 83.565 83.565L398.388 61.344 496 158.958 296.729 358.229l-11.26 11.371ZM146.6 358.183l52.459 52.46.1-.1.054.054 52.311-52.311 11.259-11.368 187.963-187.96-52.358-52.358-199.273 199.271-83.565-83.565-52.359 52.359 83.464 83.463Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={46}
          height={46}
          fill="none"
          className="mx-auto"
        >
          <path
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M21.083 42.167 3.833 28.75h9.584c0-22.91 18.55-25.553 28.75-24.916C37.02 4.796 28.75 5.242 28.75 28.75h9.583l-17.25 13.417Z"
          />
        </svg>
      )}
    </>
  );
};

export default DropzoneIcon;
