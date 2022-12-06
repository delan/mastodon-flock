import { useEffect, useRef, useState } from "react";
import {
  Button,
  Window as React95Window,
  WindowContent,
  WindowHeader,
} from "react95";
import styled from "styled-components";

import { Icon, IconProps } from "../Icon";
import type { WindowMeta } from "./WindowManager";

const blinkTimerInterval = 100;
const blinkTimerRepeat = 3;

const windowWidths = {
  constrainedViewport: {
    small: "min(100%, 360px)",
    medium: "min(100%, 390px)",
    large: "100%",
  },
  unconstrainedViewport: {
    small: "min(100%, 500px)",
    medium: "min(100%, 700px)",
    large: "min(100%, 1000px)",
  },
};

const WindowStyled = styled(React95Window)<{
  size: "small" | "medium" | "large";
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-self: center;
  z-index: 1;

  @media (max-width: 767px) {
    width: ${({ size }) => windowWidths.constrainedViewport[size]};
  }

  @media (min-width: 768px) {
    width: ${({ size }) => windowWidths.unconstrainedViewport[size]};
  }

  @media (max-height: 767px) {
  }

  @media (min-height: 768px) {
    max-height: calc(100% - 100px);
  }

  @media print {
    max-height: none;
  }
`;

const WindowHeaderStyled = styled(WindowHeader)`
  display: flex;
  align-items: center;
  padding: 2px;
  padding-inline-end: 4px;
`;

const WindowIcon = styled.span`
  display: block;

  @media print {
    display: none;
  }
`;

const WindowTitle = styled.span`
  padding-inline-start: 5px;
  margin-inline-end: auto;
  font-size: 1.05em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media print {
    & {
      color: black;
    }
  }
`;

const WindowButton = styled(Button)`
  &:last-child {
    margin-inline-start: 4px;
  }

  & > svg {
    width: 18px;
    height: 15px;
  }
`;

const WindowContentStyled = styled(WindowContent)<{
  noPadding: boolean | undefined;
}>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  ${({ noPadding }) => (noPadding ? `padding: 2px;` : "")}

  @media print {
    overflow: visible;
  }
`;

export function Window({
  children,
  icon,
  noPadding,
  onClose,
  size = "large",
  title,
  windowMeta,
}: {
  children: React.ReactNode;
  icon?: IconProps["icon"];
  noPadding?: boolean;
  onClose: () => void;
  size?: "small" | "medium" | "large";
  title: string;
  windowMeta: WindowMeta;
}) {
  const [animatedActive, setAnimatedActive] = useState<boolean | null>(null);

  const animatedActiveCounter = useRef(0);
  const animatedActiveTimer = useRef<number>();
  useEffect(() => {
    if (!windowMeta.titleBlink) {
      return;
    }

    function animate() {
      if (animatedActiveCounter.current >= blinkTimerRepeat * 2) {
        window.clearTimeout(animatedActiveTimer.current);
        animatedActiveCounter.current = 0;
        setAnimatedActive(null);
        return;
      }

      setAnimatedActive((value) => (value === null ? false : !value));
      animatedActiveCounter.current += 1;
    }

    window.clearTimeout(animatedActiveTimer.current);
    animatedActiveTimer.current = window.setInterval(
      animate,
      blinkTimerInterval,
    );
  }, [windowMeta.titleBlink]);

  return (
    <WindowStyled size={size}>
      <WindowHeaderStyled active={animatedActive ?? windowMeta.active}>
        {icon ? (
          <WindowIcon>
            <Icon icon={icon} />
          </WindowIcon>
        ) : undefined}
        <WindowTitle>{title}</WindowTitle>
        <WindowButton onClick={onClose}>
          <svg aria-label="Close Window">
            <use href="#window-close"></use>
          </svg>
        </WindowButton>
      </WindowHeaderStyled>
      <WindowContentStyled noPadding={noPadding}>
        {children}
      </WindowContentStyled>
    </WindowStyled>
  );
}
