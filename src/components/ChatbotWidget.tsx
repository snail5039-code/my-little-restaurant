'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatbotStore } from '@/lib/stores/chatbot';
import { ChatbotCharacter } from './ChatbotCharacter';
import { ChatbotPanel } from './ChatbotPanel';

export function ChatbotWidget() {
  const [mounted, setMounted] = useState(false);
  const {
    isOpen,
    setIsOpen,
    characterClickCount,
    incrementClickCount,
    resetClickCount,
    characterY,
    characterX,
    setCharacterY,
    setCharacterX,
    isHiding,
    setIsHiding,
  } = useChatbotStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const characterRef = useRef<HTMLDivElement>(null);

  // Hydration 문제 해결
  useEffect(() => {
    setMounted(true);
  }, []);

  // 캐릭터 클릭: 채팅 열기/닫기 또는 클릭 카운트 증가 (드래그 중이 아닐 때만)
  const handleCharacterClick = () => {
    if (isDragging) return; // 드래그 중이면 클릭 무시

    if (!isOpen) {
      setIsOpen(true);
      resetClickCount();
    } else if (characterClickCount === 0) {
      // 처음 클릭한 경우: 채팅창 닫기
      setIsOpen(false);
    } else {
      // 이미 클릭했던 경우: 클릭 카운트 증가
      incrementClickCount();

      // 5번 이상 누르면 2초 뒤 숨김 상태 해제
      if (characterClickCount >= 5) {
        setTimeout(() => {
          setIsHiding(false);
          resetClickCount();
        }, 2000);
      }
    }
  };

  // 마우스 다운: 드래그 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpen) return; // 채팅창이 열려있으면 드래그 불가
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // 마우스 무브: 캐릭터 위치 변경
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const newXPercent = (characterX * windowWidth) / 100 + deltaX;
      const newYPercent = (characterY * windowHeight) / 100 + deltaY;

      const newXValue = (newXPercent / windowWidth) * 100;
      const newYValue = (newYPercent / windowHeight) * 100;

      setCharacterX(newXValue);
      setCharacterY(newYValue);
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, characterX, characterY, setCharacterX, setCharacterY]);

  if (!mounted) return null;

  // 채팅창이 화면을 넘지 않도록 위치 계산
  const getPanelPosition = () => {
    const characterPercentX = characterX;
    const characterPercentY = characterY;

    // 패널을 캐릭터 왼쪽에 배치하되, 화면을 넘치지 않도록
    const panelWidth = 384; // w-96 = 24rem = 384px
    const panelHeight = 500; // 기본 높이

    // 화면 우측에 캐릭터가 있으면 패널을 왼쪽에, 좌측에 있으면 오른쪽에
    const isCharacterOnRight = characterPercentX > 50;

    return {
      left: isCharacterOnRight ? 'auto' : 'auto',
      right: isCharacterOnRight ? '120px' : 'auto',
    };
  };

  return (
    <>
      {/* 캐릭터 */}
      <div
        ref={characterRef}
        className={`fixed z-50 transition-all select-none ${isDragging ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${
          isHiding ? 'opacity-0 pointer-events-none' : ''
        }`}
        style={{
          left: `${characterX}%`,
          top: `${characterY}%`,
          transform: 'translate(-50%, -50%)',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        <ChatbotCharacter
          clickCount={characterClickCount}
          onCharacterClick={handleCharacterClick}
          isHiding={isHiding}
        />
      </div>

      {/* 채팅 패널 */}
      {isOpen && <ChatbotPanel characterX={characterX} characterY={characterY} />}
    </>
  );
}
