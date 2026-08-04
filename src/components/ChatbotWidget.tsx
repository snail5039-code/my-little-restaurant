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
  const characterRef = useRef<HTMLDivElement>(null);
  // 실제로 드래그(이동)가 발생했는지 ref로 동기 추적 — 클릭 핸들러가 참조하는
  // React state는 리렌더링을 거쳐야 갱신되므로, 빠른 클릭 시 mouseup이 먼저
  // 발생해도 state가 아직 반영되지 않아 클릭이 무시되는 경쟁 상태를 피하기 위함
  const wasDraggedRef = useRef(false);

  // Hydration 문제 해결
  useEffect(() => {
    setMounted(true);
  }, []);

  // 캐릭터 클릭: 채팅창 열기/닫기 토글 + 클릭할 때마다 대사 단계 진행
  const handleCharacterClick = () => {
    if (wasDraggedRef.current) {
      // 드래그 후 발생하는 클릭은 무시
      wasDraggedRef.current = false;
      return;
    }

    // 채팅창은 클릭할 때마다 열림/닫힘 토글
    setIsOpen(!isOpen);

    // 클릭 카운트는 열림/닫힘과 무관하게 항상 증가 (대사 단계 진행)
    incrementClickCount();

    // 5번 이상 누르면 2초 뒤 숨김 상태 해제
    if (characterClickCount >= 5) {
      setTimeout(() => {
        setIsHiding(false);
        resetClickCount();
      }, 2000);
    }
  };

  // 마우스 다운: 드래그 시작 (문서 리스너를 즉시 동기적으로 등록해 경쟁 상태 방지)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpen) return; // 채팅창이 열려있으면 드래그 불가

    wasDraggedRef.current = false;
    const startX = e.clientX;
    const startY = e.clientY;
    let lastX = startX;
    let lastY = startY;
    let currentX = characterX;
    let currentY = characterY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const movedX = Math.abs(moveEvent.clientX - startX);
      const movedY = Math.abs(moveEvent.clientY - startY);

      if (!wasDraggedRef.current && (movedX > 3 || movedY > 3)) {
        wasDraggedRef.current = true;
        setIsDragging(true);
      }

      if (!wasDraggedRef.current) return;

      const deltaX = moveEvent.clientX - lastX;
      const deltaY = moveEvent.clientY - lastY;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      currentX = Math.max(0, Math.min(100, currentX + (deltaX / windowWidth) * 100));
      currentY = Math.max(0, Math.min(100, currentY + (deltaY / windowHeight) * 100));

      setCharacterX(currentX);
      setCharacterY(currentY);

      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!mounted) return null;

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
