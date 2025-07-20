"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import light from "../../public/images/about/sun-01.svg";
import dark from "../../public/images/about/vector.svg";

const DarkSwitch = ({ isLight, switchTheme }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div id="my_switcher" className="my_switcher">
      {mounted && (
        <ul onClick={switchTheme}>
          {isLight ? (
            <li>
              <button data-theme="light" className="setColor light">
                <Image src={dark} alt="Sun images" />
              </button>
            </li>
          ) : (
            <li>
              <button data-theme="dark" className="setColor dark">
                <Image src={light} alt="Vector Images" />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default DarkSwitch;