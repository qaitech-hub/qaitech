import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ScreenShotsModalNewHandler = ({
  images,
  width,
  height,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-[#060314] bg-opacity-[90%] flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Модальное окно */}
        <motion.div
          className={`relative bg-white rounded-[20px] border-[1px] border-primary shadow-lg mx-[20px] overflow-hidden`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике внутри модалки
        >
          {/* Кнопка закрытия */}
          {/* <button
            className="absolute select-none top-2 right-2 text-white bg-[#99deaf] bg-opacity-70 rounded-full w-8 h-8 flex items-center justify-center z-10"
            onClick={onClose}
          >
            &times;
          </button> */}

          {/* Изображение */}
          <div className="relative">
            {!!images[currentIndex] ? (
              <img
                src={"data:image/jpeg;base64, " + images[currentIndex]}
                alt={`Slide ${currentIndex}`}
                layout="fill"
                className="pointer-events-none object-contain select-none max-h-[calc(100vh-20px)]"
              />
            ) : (
              <img
                src={
                  "https://phoneky.co.uk/thumbs/screensavers/down/fantasy/hanged_38katsna.gif"
                }
                alt={`Slide ${currentIndex}`}
                layout="fill"
                className="pointer-events-none object-contain select-none w-[500px] h-[500px]"
              />
            )}
          </div>

          {/* Стрелки навигации */}
          <button
            className="absolute select-none left-2 top-1/2 transform -translate-y-1/2 bg-[#99deaf] bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
            onClick={handlePrev}
          >
            &#10094;
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#99deaf] bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
            onClick={handleNext}
          >
            &#10095;
          </button>

          {/* Индикатор текущего изображения */}
          <div className="absolute select-none bottom-4 left-1/2 transform bg-[#99deaf] bg-opacity-70 rounded-full px-[6px] py-[6px] -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-[#212121]"
                }`}
                onClick={() => setCurrentIndex(index)}
              ></button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreenShotsModalNewHandler;
