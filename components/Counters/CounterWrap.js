"use client";
import { useEffect, useState, useRef } from "react";

import dynamic from "next/dynamic";
const Odometer = dynamic(() => import("react-odometerjs"), { ssr: false });

const CounterWrap = ({ value, format = "d" }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      setCount(value);
    }
  }, [isVisible, value]);

  return (
    <span ref={counterRef}>
      <Odometer value={count} format={format} duration={2000} />
    </span>
  );
};

export default CounterWrap;
