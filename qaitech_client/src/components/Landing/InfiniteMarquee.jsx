import React from "react";

const InfiniteMarquee = () => {
  const items = [
    {
      value: "131к",
      role: "Manual QA",
    },
    {
      value: "225к",
      role: "Test Automation Engineer",
    },
    {
      value: "170к",
      role: "Penetration Tester",
    },
    {
      value: "167к",
      role: "Perfomance Tester",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full">
      <div className="flex select-none">
        {/* Первый набор элементов */}
        <div className="flex shrink-0 items-center justify-around min-w-full py-[40px] animate-marquee whitespace-nowrap">
          {items.map((item, index) => (
            <span
              key={`first-${index}`}
              className="text-[18px] font-normal text-primary leading-[20px] tracking-[-2.5%] mx-[20px]"
            >
              <span className="font-medium">{item.value}</span> руб. средняя
              мес. зарплата <span className="font-medium">{item.role}</span>{" "}
              источник хабр. карьера
            </span>
          ))}
        </div>

        {/* Дублированный набор элементов для бесконечного эффекта */}
        <div className="flex shrink-0 items-center justify-around min-w-full py-[40px] animate-marquee whitespace-nowrap">
          {items.map((item, index) => (
            <span
              key={`second-${index}`}
              className="text-[18px] font-normal text-primary leading-[20px] tracking-[-2.5%] mx-[20px]"
            >
              <span className="font-medium">{item.value}</span> руб. средняя
              мес. зарплата <span className="font-medium">{item.role}</span>{" "}
              источник хабр. карьера
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfiniteMarquee;
