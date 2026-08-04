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

  // 드래그 진행 중 좌표를 ref로도 들고 있어 pointermove 핸들러가 최신 값을
  // state 리렌더링 없이 바로 읽을 수 있게 한다 (모바일 터치에서도 끊김 없이 동작)
  const dragStateRef = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0, currentX: 0, currentY: 0 });

  // Pointer Events로 마우스/터치를 함께 처리 (마우스 전용 mousedown/mousemove로는
  // 모바일 터치 드래그가 전혀 동작하지 않아서 교체함)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpen) return; // 채팅창이 열려있으면 드래그 불가

    e.currentTarget.setPointerCapture(e.pointerId);
    wasDraggedRef.current = false;
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      currentX: characterX,
      currentY: characterY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    const movedX = Math.abs(e.clientX - drag.startX);
    const movedY = Math.abs(e.clientY - drag.startY);

    if (!wasDraggedRef.current && (movedX > 3 || movedY > 3)) {
      wasDraggedRef.current = true;
      setIsDragging(true);
    }

    if (!wasDraggedRef.current) return;

    const deltaX = e.clientX - drag.lastX;
    const deltaY = e.clientY - drag.lastY;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    drag.currentX = Math.max(0, Math.min(100, drag.currentX + (deltaX / windowWidth) * 100));
    drag.currentY = Math.max(0, Math.min(100, drag.currentY + (deltaY / windowHeight) * 100));

    setCharacterX(drag.currentX);
    setCharacterY(drag.currentY);

    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
