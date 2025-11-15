import { useEffect, useRef } from "react";

export const Input = ({
  ref = null,
  value = "",
  disabled = false,
  onChange = () => {},
  label = "",
  type = "text",
  error = "",
  placeholder = "",
  paddingTailwind = "px-[12px] py-[8px]",
  borderTailwind = "border-[1px] border-accent-purple",
  roundedTailwind = "rounded-[26px]",
  textTailwind = "text-[10px] leading-[16px] tracking-[-1.5%] text-accent-purple",
  placeholderTailwind = "placeholder:text-accent-dark_purple",
  labelTailwind = "mb-[8px] text-[15px] leading-[20px] tracking-[-2%] font-medium",
  errorTailwind = "mt-[8px] text-[15px] leading-[20px] tracking-[-2%] font-medium",
  widthTailwind = "w-full",
  style = "",
  onEnterPress = () => {},
}) => {
  return (
    <div className={`flex flex-col ${widthTailwind}`}>
      {label && (
        <p className={`text-accent-purple select-none ${labelTailwind}`}>
          {label}
        </p>
      )}

      <input
        autoComplete="off"
        aria-autocomplete="none"
        ref={ref}
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${paddingTailwind} ${borderTailwind} ${roundedTailwind} ${textTailwind} ${placeholderTailwind} ${style} bg-transparent w-full outline-none truncate`}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnterPress();
        }}
      />

      {error && <p className={`text-[#F2A01B] ${errorTailwind}`}>{error}</p>}
    </div>
  );
};

export const DigitsCodeInput = ({
  label = "",
  error = "",
  code = undefined,
  setCode = () => {},
  disabled = false,
  onEnterPress = () => {},
  labelTailwind = "mb-[8px] text-[15px] leading-[20px] tracking-[-2%] font-medium",
}) => {
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  function handleInput(e, index) {
    const input = e.target;
    const previousInput = inputRefs[index - 1];
    const nextInput = inputRefs[index + 1];

    const newCode = [...code];

    newCode[index] = input.value;

    setCode(newCode.join(""));

    input.select();

    if (input.value === "") {
      if (previousInput) {
        previousInput.current.focus();
      }
    } else if (nextInput) {
      nextInput.current.select();
    }
  }

  function handleFocus(e) {
    e.target.select();
  }

  function handleKeyDown(e, index) {
    const input = e.target;
    const previousInput = inputRefs[index - 1];

    if (e.key === "Enter") {
      onEnterPress();
      return;
    }

    if ((e.keyCode === 8 || e.keyCode === 46) && input.value === "") {
      e.preventDefault();
      setCode(
        (prevCode) => prevCode.slice(0, index) + prevCode.slice(index + 1)
      );
      if (previousInput) {
        previousInput.current.focus();
      }
    }
  }

  const handlePaste = (e) => {
    const pastedCode = e.clipboardData.getData("text");
    if (pastedCode.length === 6) {
      setCode(pastedCode);
      inputRefs.forEach((inputRef, index) => {
        inputRef.current.value = pastedCode.charAt(index);
      });
    }
  };

  useEffect(() => {
    inputRefs[0]?.current?.focus();
  }, []);

  return (
    <div className="flex flex-col min-w-[20px] w-full">
      {label && (
        <p className={`select-none ${labelTailwind} text-accent-purple`}>
          {label}
        </p>
      )}
      <div className="flex flex-row gap-[24px] mx-auto">
        {[...Array(6)].map((_, key) => (
          <input
            key={key}
            ref={inputRefs[key]}
            type="text"
            maxLength={1}
            onChange={(e) => handleInput(e, key)}
            onFocus={handleFocus}
            onKeyDown={(e) => handleKeyDown(e, key)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`text-[15px] w-[52px] outline-none text-center leading-[20px] tracking-[-2%] px-[12px] py-[14px] border-[1px] border-accent-purple
 text-accent-purple
bg-transparent rounded-[12px]`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-[8px] text-[15px] leading-[20px] font-medium tracking-[-2%] text-[#F2A01B]">
          {error}
        </p>
      )}
    </div>
  );
};

export const TextareaAutoResize = ({
  id = "textarea",
  ref = null,
  value = "",
  disabled = false,
  onChange = () => {},
  label = "",
  type = "text",
  error = "",
  placeholder = "",
  paddingTailwind = "px-[12px] py-[8px]",
  borderTailwind = "border-[1px] border-accent-purple",
  roundedTailwind = "rounded-[26px]",
  textTailwind = "text-[10px] leading-[16px] tracking-[-1.5%] text-accent-purple",
  placeholderTailwind = "placeholder:text-accent-dark_purple",
  labelTailwind = "mb-[8px] text-[15px] leading-[20px] tracking-[-2%] font-medium",
  errorTailwind = "mt-[8px] text-[15px] leading-[20px] tracking-[-2%] font-medium",
  widthTailwind = "w-full",
  style = "",
  onEnterPress = () => {},
  rows = 8,
  cols = 40,
}) => {
  return (
    <div className={`flex flex-col ${widthTailwind}`}>
      {label && (
        <p className={`text-accent-purple select-none ${labelTailwind}`}>
          {label}
        </p>
      )}

      <textarea
        id={id}
        autoComplete="off"
        aria-autocomplete="none"
        ref={ref}
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`hideScrollbarNav ${paddingTailwind} ${borderTailwind} ${roundedTailwind} ${textTailwind} ${placeholderTailwind} ${style} bg-transparent w-full outline-none resize-none whitespace-pre-wrap break-words`}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnterPress();
        }}
        name="postContent"
        rows={rows}
        cols={cols}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      />

      {error && <p className={`text-[#F2A01B] ${errorTailwind}`}>{error}</p>}
    </div>
  );
};
