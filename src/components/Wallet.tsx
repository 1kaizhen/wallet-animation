import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import walletBack from '../../Assets/wallet/Wallet.png';
import walletFront from '../../Assets/wallet/Front Wallet.png';
import { BankCard } from './BankCard';
import type { BankType } from '../data/bankCardsData';

interface WalletProps {
  className?: string;
}

// Slot 0 = Back (HDFC), Slot 1 = Middle (Axis), Slot 2 = Front (ICICI)
const SLOTS = [
  { tuckedY: -30, poppedY: -112, scale: 0.935, zIndex: 1 },
  { tuckedY: -16, poppedY: -58, scale: 0.968, zIndex: 2 },
  { tuckedY: 0, poppedY: -6, scale: 1.0, zIndex: 3 },
];

export const Wallet: React.FC<WalletProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cardOrder, setCardOrder] = useState<BankType[]>(['hdfc', 'axis', 'icici']);
  const [expandedCard, setExpandedCard] = useState<BankType | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const cardOrderRef = useRef(cardOrder);
  cardOrderRef.current = cardOrder;

  const expandedCardRef = useRef(expandedCard);
  expandedCardRef.current = expandedCard;

  const isAnimatingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const currentDragXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const currentDragYRef = useRef(0);
  const cardFlipAngleRef = useRef(0);
  const isFlippedRef = useRef(false);
  const dragModeRef = useRef<'unknown' | 'vertical' | 'horizontal'>('unknown');
  const touchedBankRef = useRef<BankType | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const walletBodyRef = useRef<HTMLDivElement>(null);
  const walletBackRef = useRef<HTMLImageElement>(null);
  const walletFrontRef = useRef<HTMLImageElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const cardRefs = useRef<Record<BankType, HTMLDivElement | null>>({
    hdfc: null,
    axis: null,
    icici: null,
  });

  // Initial positioning and synchronization
  const syncCardPositions = (order: BankType[], open: boolean) => {
    order.forEach((bank, slotIdx) => {
      const el = cardRefs.current[bank];
      if (el) {
        const slot = SLOTS[slotIdx];
        gsap.set(el, {
          y: open ? slot.poppedY : slot.tuckedY,
          scale: open ? 1.0 : slot.scale,
          zIndex: slot.zIndex,
          opacity: 1,
          rotateY: 0,
          filter: 'blur(0px)',
          transformOrigin: 'center center',
          transformPerspective: 1200,
          force3D: true,
        });
      }
    });
    if (walletBackRef.current) gsap.set(walletBackRef.current, { filter: 'blur(0px)', opacity: 1, y: 0 });
    if (walletFrontRef.current) gsap.set(walletFrontRef.current, { filter: 'blur(0px)', opacity: 1, y: 0 });
  };

  useEffect(() => {
    syncCardPositions(cardOrder, isOpen);
  }, []);

  // Expand the front card to exact center of the screen with smooth easing and background blur
  const expandFrontCard = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const frontBank = cardOrderRef.current[2];
    const frontEl = cardRefs.current[frontBank];
    if (!frontEl) {
      isAnimatingRef.current = false;
      return;
    }

    setExpandedCard(frontBank);
    expandedCardRef.current = frontBank;
    cardFlipAngleRef.current = 0;
    isFlippedRef.current = false;
    setIsFlipped(false);

    const otherBanks = cardOrderRef.current.slice(0, 2);

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // 1. Move front card to exact vertical center with smooth expo easing
    tl.to(frontEl, {
      y: -20,
      scale: 1.2,
      rotateY: 0,
      transformPerspective: 1200,
      duration: 0.55,
      ease: 'power3.out',
    }, 0);

    // 2. Smoothly blur, fade out, and move wallet body and other cards DOWN by 65px
    otherBanks.forEach((bank, idx) => {
      const el = cardRefs.current[bank];
      if (el) {
        const slot = SLOTS[idx];
        tl.to(el, {
          opacity: 0,
          y: slot.poppedY + 65,
          scale: 0.92,
          filter: 'blur(14px)',
          duration: 0.48,
          ease: 'power2.out',
        }, 0);
      }
    });

    if (walletBackRef.current) {
      tl.to(walletBackRef.current, {
        opacity: 0,
        y: 65,
        filter: 'blur(14px)',
        duration: 0.48,
        ease: 'power2.out',
      }, 0);
    }
    if (walletFrontRef.current) {
      tl.to(walletFrontRef.current, {
        opacity: 0,
        y: 65,
        filter: 'blur(14px)',
        duration: 0.48,
        ease: 'power2.out',
      }, 0);
    }

    // Expand glow
    tl.to(glowRef.current, {
      opacity: 1,
      scale: 1.45,
      duration: 0.55,
      ease: 'power2.out',
    }, 0);
  };

  // Collapse expanded card back into wallet with tactile pull effect, de-blur and pocket tuck
  const collapseExpandedCard = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Switch card layer back immediately so it crossfades smoothly while sliding into pocket
    setExpandedCard(null);
    expandedCardRef.current = null;
    cardFlipAngleRef.current = 0;
    isFlippedRef.current = false;
    setIsFlipped(false);

    const frontBank = cardOrderRef.current[2];
    const frontEl = cardRefs.current[frontBank];
    const otherBanks = cardOrderRef.current.slice(0, 2);

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // 1. Smoothly de-blur and move wallet pieces back up to 0 from 65px
    if (walletBackRef.current) {
      tl.to(walletBackRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.45,
        ease: 'power3.out',
      }, 0);
    }
    if (walletFrontRef.current) {
      tl.to(walletFrontRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.45,
        ease: 'power3.out',
      }, 0);
    }

    otherBanks.forEach((bank, slotIdx) => {
      const el = cardRefs.current[bank];
      if (el) {
        const slot = SLOTS[slotIdx];
        tl.to(el, {
          opacity: 1,
          y: isOpenRef.current ? slot.poppedY : slot.tuckedY,
          scale: isOpenRef.current ? 1.0 : slot.scale,
          filter: 'blur(0px)',
          duration: 0.46,
          ease: 'power3.out',
        }, 0);
      }
    });

    // 2. Return front card with elastic pull-down, resetting flip to 0 and snapping into pocket
    if (frontEl) {
      gsap.set(frontEl, { zIndex: SLOTS[2].zIndex });

      tl.to(frontEl, {
        rotateY: 0,
        y: isOpenRef.current ? SLOTS[2].poppedY : SLOTS[2].tuckedY,
        scale: 1.0,
        duration: 0.48,
        ease: 'power3.inOut',
      }, 0);
    }

    // 3. Tactile pocket cushion snap as card lands inside the wallet pocket
    if (walletBodyRef.current) {
      tl.to(walletBodyRef.current, {
        scale: 0.982,
        duration: 0.12,
        ease: 'power2.out',
      }, 0.22)
      .to(walletBodyRef.current, {
        scale: 1.0,
        duration: 0.2,
        ease: 'back.out(2.2)',
      }, 0.34);
    }

    tl.to(glowRef.current, {
      opacity: 0.65,
      scale: 1.0,
      duration: 0.45,
      ease: 'power2.inOut',
    }, 0);
  };

  // Drag Gesture Handlers: ENABLED ONLY ON OPEN STATE
  const handlePointerDown = (e: React.PointerEvent, bank: BankType) => {
    // Only allow dragging if wallet is in OPEN state and not animating
    if (!isOpenRef.current || isAnimatingRef.current) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    touchedBankRef.current = bank;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    currentDragXRef.current = 0;
    currentDragYRef.current = 0;
    dragModeRef.current = 'unknown';
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;
    currentDragXRef.current = deltaX;
    currentDragYRef.current = deltaY;

    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      hasDraggedRef.current = true;
    }

    const currentOrder = cardOrderRef.current;
    const touchedBank = touchedBankRef.current || currentOrder[2];
    const touchedSlotIdx = currentOrder.indexOf(touchedBank);
    const frontBank = currentOrder[2];
    const frontEl = cardRefs.current[frontBank];

    if (!expandedCardRef.current) {
      if (touchedSlotIdx === 2) {
        // Dragging FRONT card UP to expand into spotlight (HIGH FRICTION: 0.45 multiplier, 220px tracking)
        if (deltaY < 0 && frontEl) {
          const baseY = SLOTS[2].poppedY;
          const progress = Math.min(Math.abs(deltaY) / 220, 1);

          gsap.set(frontEl, {
            y: baseY + deltaY * 0.45,
            scale: 1.0 + progress * 0.2,
          });

          // Dynamic fade, blur, and downward displacement for wallet and other cards
          const walletOffsetY = progress * 65;
          const fadeProgress = Math.max(0, 1 - progress * 1.15);
          const blurAmount = progress * 14;
          const otherBanks = currentOrder.slice(0, 2);
          otherBanks.forEach((b, idx) => {
            const el = cardRefs.current[b];
            if (el) gsap.set(el, { y: SLOTS[idx].poppedY + walletOffsetY, opacity: fadeProgress, filter: `blur(${blurAmount}px)` });
          });
          if (walletBackRef.current) gsap.set(walletBackRef.current, { y: walletOffsetY, opacity: fadeProgress, filter: `blur(${blurAmount}px)` });
          if (walletFrontRef.current) gsap.set(walletFrontRef.current, { y: walletOffsetY, opacity: fadeProgress, filter: `blur(${blurAmount}px)` });
        }
      } else if (touchedSlotIdx >= 0) {
        // Dragging a NON-FRONT card UP (Middle or Back card) - FIRM PHYSICAL FEEDBACK
        if (deltaY < 0) {
          const touchedEl = cardRefs.current[touchedBank];
          if (touchedEl) {
            const baseY = SLOTS[touchedSlotIdx].poppedY;
            const progress = Math.min(Math.abs(deltaY) / 180, 1);
            gsap.set(touchedEl, {
              y: baseY + deltaY * 0.45,
              scale: SLOTS[touchedSlotIdx].scale + progress * 0.08,
            });
          }
        }
      }
    } else {
      // When card is OUT in spotlight:
      // Determine drag mode if not yet established
      if (dragModeRef.current === 'unknown') {
        if (isFlippedRef.current) {
          // When showing backside, ONLY allow horizontal swipe (to flip back)
          if (Math.abs(deltaX) > Math.abs(deltaY) + 4) {
            dragModeRef.current = 'horizontal';
          }
        } else {
          if (Math.abs(deltaY) > Math.abs(deltaX) + 6 && deltaY < 0) {
            dragModeRef.current = 'vertical';
          } else if (Math.abs(deltaX) > Math.abs(deltaY) + 4) {
            dragModeRef.current = 'horizontal';
          }
        }
      }

      if (dragModeRef.current === 'vertical' && deltaY < 0 && frontEl) {
        // Dragging UP to return to wallet (HIGH FRICTION: 0.45 multiplier, 220px tracking)
        const progress = Math.min(Math.abs(deltaY) / 220, 1);
        gsap.set(frontEl, {
          y: -20 + deltaY * 0.45,
          scale: 1.2 - progress * 0.15,
        });

        // Dynamic de-blur, fade in, and upward return for wallet and other cards
        const walletOffsetY = (1 - progress) * 65;
        const fadeProgress = Math.min(1, progress * 1.15);
        const blurAmount = Math.max(0, (1 - progress) * 14);
        const otherBanks = currentOrder.slice(0, 2);
        otherBanks.forEach((b, idx) => {
          const el = cardRefs.current[b];
          if (el) gsap.set(el, { y: SLOTS[idx].poppedY + walletOffsetY, opacity: fadeProgress, filter: `blur(${blurAmount}px)` });
        });
        if (walletBackRef.current) gsap.set(walletBackRef.current, { y: walletOffsetY, opacity: fadeProgress, filter: `blur(${blurAmount}px)` });
        if (walletFrontRef.current) gsap.set(walletFrontRef.current, { y: walletOffsetY, opacity: fadeProgress, filter: `blur(${blurAmount}px)` });
      } else if (dragModeRef.current === 'horizontal' && frontEl) {
        // Swiping horizontally: Exactly 1 flip (0 -> 180 or 180 -> 0)
        let dynamicAngle = cardFlipAngleRef.current;

        if (!isFlippedRef.current) {
          // FRONT -> BACK (clamp between -180 and 180)
          const progress = Math.min(Math.abs(deltaX) / 140, 1);
          dynamicAngle = deltaX < 0 ? -progress * 180 : progress * 180;

          // Toggle face at 90° midpoint
          if (Math.abs(dynamicAngle) >= 90) {
            setIsFlipped(true);
          } else {
            setIsFlipped(false);
          }
        } else {
          // BACK -> FRONT (dragging backwards flips back to 0)
          const baseAngle = cardFlipAngleRef.current;
          const progress = Math.min(Math.abs(deltaX) / 140, 1);
          if (baseAngle > 0) {
            // Started at +180
            dynamicAngle = deltaX < 0 ? 180 - progress * 180 : Math.min(180 + progress * 180, 360);
          } else {
            // Started at -180
            dynamicAngle = deltaX > 0 ? -180 + progress * 180 : Math.max(-180 - progress * 180, -360);
          }

          // Toggle face at 90° / 270° midpoint
          const absAngle = Math.abs(dynamicAngle) % 360;
          if (absAngle < 90 || absAngle > 270) {
            setIsFlipped(false);
          } else {
            setIsFlipped(true);
          }
        }

        gsap.set(frontEl, {
          rotateY: dynamicAngle,
          transformPerspective: 1200,
          transformOrigin: 'center center',
        });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    const deltaX = currentDragXRef.current;
    const deltaY = currentDragYRef.current;
    const mode = dragModeRef.current;
    const currentOrder = cardOrderRef.current;
    const touchedBank = touchedBankRef.current || currentOrder[2];
    const touchedSlotIdx = currentOrder.indexOf(touchedBank);

    if (!expandedCardRef.current) {
      if (touchedSlotIdx === 2) {
        // Firm activation threshold: requires deliberate pull UP
        if (deltaY < -65) {
          expandFrontCard();
        } else {
          // Reset front card back to popped state
          const frontEl = cardRefs.current[touchedBank];
          if (frontEl) {
            gsap.to(frontEl, {
              y: SLOTS[2].poppedY,
              scale: 1.0,
              duration: 0.28,
              ease: 'power3.out',
            });
          }
          const otherBanks = currentOrder.slice(0, 2);
          otherBanks.forEach((b, idx) => {
            const el = cardRefs.current[b];
            if (el) gsap.to(el, { y: SLOTS[idx].poppedY, opacity: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power3.out' });
          });
          if (walletBackRef.current) gsap.to(walletBackRef.current, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power3.out' });
          if (walletFrontRef.current) gsap.to(walletFrontRef.current, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power3.out' });
        }
      } else if (touchedSlotIdx >= 0) {
        // Dragged a back or middle card
        if (deltaY < -35) {
          // Dragged up enough: execute fast snappy swap to front!
          bringCardToFront(touchedBank);
        } else {
          // Released below threshold: snap back to its slot
          const touchedEl = cardRefs.current[touchedBank];
          if (touchedEl) {
            gsap.to(touchedEl, {
              y: SLOTS[touchedSlotIdx].poppedY,
              scale: SLOTS[touchedSlotIdx].scale,
              duration: 0.25,
              ease: 'power3.out',
            });
          }
        }
      }
    } else {
      const frontBank = currentOrder[2];
      const frontEl = cardRefs.current[frontBank];

      // Vertical drag UP to return to wallet (only when showing FRONT side, firm threshold -65)
      if (!isFlippedRef.current && (mode === 'vertical' || Math.abs(deltaY) > Math.abs(deltaX)) && deltaY < -65) {
        collapseExpandedCard();
      }
      // Horizontal swipe to flip card (left <-> right)
      else if ((mode === 'horizontal' || Math.abs(deltaX) > Math.abs(deltaY)) && Math.abs(deltaX) > 40 && frontEl) {
        const isCurrentlyBack = isFlippedRef.current;
        let targetAngle: number;
        let nextIsFlipped: boolean;

        if (!isCurrentlyBack) {
          // FRONT -> BACK: Flips once and stops at 180°
          targetAngle = deltaX < 0 ? -180 : 180;
          nextIsFlipped = true;
        } else {
          // BACK -> FRONT: Flips backwards once and stops at 0°
          const baseAngle = cardFlipAngleRef.current;
          if (baseAngle > 0) {
            targetAngle = deltaX < 0 ? 0 : 360;
          } else {
            targetAngle = deltaX > 0 ? 0 : -360;
          }
          nextIsFlipped = false;
        }

        let faceSwitched = false;
        gsap.to(frontEl, {
          rotateY: targetAngle,
          transformPerspective: 1200,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: function() {
            // Switch face at 90° midpoint during animation
            const currentAngle = Math.abs(gsap.getProperty(frontEl, 'rotateY') as number) % 360;
            const shouldShowBack = currentAngle > 90 && currentAngle < 270;
            if (shouldShowBack !== faceSwitched) {
              faceSwitched = shouldShowBack;
              setIsFlipped(shouldShowBack);
            }
          },
          onComplete: () => {
            const normalizedAngle = nextIsFlipped ? (targetAngle < 0 ? -180 : 180) : 0;
            cardFlipAngleRef.current = normalizedAngle;
            isFlippedRef.current = nextIsFlipped;
            setIsFlipped(nextIsFlipped);
            gsap.set(frontEl, { rotateY: normalizedAngle });
          },
        });
      }
      // Below threshold: snap back to current resting face
      else {
        if (frontEl) {
          gsap.to(frontEl, {
            y: -20,
            scale: 1.2,
            rotateY: cardFlipAngleRef.current,
            transformPerspective: 1200,
            duration: 0.3,
            ease: 'power3.out',
          });
        }
        const otherBanks = currentOrder.slice(0, 2);
        otherBanks.forEach((b, idx) => {
          const el = cardRefs.current[b];
          if (el) gsap.to(el, { y: SLOTS[idx].poppedY + 65, opacity: 0, filter: 'blur(14px)', duration: 0.3, ease: 'power3.out' });
        });
        if (walletBackRef.current) gsap.to(walletBackRef.current, { y: 65, opacity: 0, filter: 'blur(14px)', duration: 0.3, ease: 'power3.out' });
        if (walletFrontRef.current) gsap.to(walletFrontRef.current, { y: 65, opacity: 0, filter: 'blur(14px)', duration: 0.3, ease: 'power3.out' });
      }
    }
  };

  // Move non-front card to front slot with fast and snappy animation (0.36s total!)
  const bringCardToFront = (clickedBank: BankType) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const currentOrder = cardOrderRef.current;
    const currentSlotIdx = currentOrder.indexOf(clickedBank);
    const targetEl = cardRefs.current[clickedBank];

    if (!targetEl) {
      isAnimatingRef.current = false;
      return;
    }

    if (!isOpenRef.current) {
      setIsOpen(true);
      isOpenRef.current = true;
    }

    // New stack order: clickedBank moves to Front (index 2)
    const newRemaining = currentOrder.filter((b) => b !== clickedBank);
    const newOrder: BankType[] = [...newRemaining, clickedBank];

    const tl = gsap.timeline({
      onComplete: () => {
        setCardOrder(newOrder);
        cardOrderRef.current = newOrder;
        syncCardPositions(newOrder, true);
        isAnimatingRef.current = false;
      },
    });

    const startingZIndex = SLOTS[currentSlotIdx].zIndex;
    gsap.set(targetEl, {
      zIndex: startingZIndex,
      transformOrigin: 'center center',
    });

    // Elevate straight up FROM BEHIND to top peak (~0.60s total)
    tl.to(targetEl, {
      y: -260,
      scale: 0.82,
      duration: 0.28,
      ease: 'power3.out',
    })
      .set(targetEl, { zIndex: SLOTS[2].zIndex })
      .to(targetEl, {
        y: SLOTS[2].poppedY,
        scale: 1.0,
        duration: 0.32,
        ease: 'power3.out',
      });

    // Concurrently shift remaining cards smoothly to their new slots
    newRemaining.forEach((bank, newSlotIdx) => {
      const el = cardRefs.current[bank];
      if (!el) return;
      const slot = SLOTS[newSlotIdx];

      tl.to(el, {
        y: slot.poppedY,
        scale: 1.0,
        zIndex: slot.zIndex,
        duration: 0.38,
        ease: 'power3.inOut',
      }, 0.1);
    });

    tl.to(glowRef.current, {
      opacity: 1,
      scale: 1.35,
      duration: 0.4,
      ease: 'power2.out',
    }, 0);
  };

  // Card Click:
  const handleCardClick = (e: React.MouseEvent, clickedBank: BankType) => {
    e.stopPropagation();

    // If user just performed a drag gesture, suppress the click event!
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    // If card is expanded in spotlight, clicking it collapses it
    if (expandedCardRef.current) {
      collapseExpandedCard();
      return;
    }

    const currentOrder = cardOrderRef.current;
    const currentSlotIdx = currentOrder.indexOf(clickedBank);

    // If clicking front card (#2):
    // - When closed: open wallet
    // - When open: expand to center of screen!
    if (currentSlotIdx === 2) {
      if (!isOpenRef.current) {
        handleWalletClick();
      } else {
        expandFrontCard();
      }
      return;
    }

    bringCardToFront(clickedBank);
  };

  // Wallet Body Click: Toggle Open / Retract
  const handleWalletClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    if (expandedCardRef.current) {
      collapseExpandedCard();
      return;
    }

    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const nextOpen = !isOpenRef.current;
    setIsOpen(nextOpen);
    isOpenRef.current = nextOpen;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // Subtle tactile squeeze
    tl.to(walletBodyRef.current, {
      scale: 0.96,
      duration: 0.1,
      ease: 'power2.out',
    })
      .to(walletBodyRef.current, {
        scale: 1.015,
        duration: 0.25,
        ease: 'back.out(1.4)',
      })
      .to(walletBodyRef.current, {
        scale: 1.0,
        duration: 0.18,
        ease: 'power2.out',
      });

    const currentOrder = cardOrderRef.current;

    if (nextOpen) {
      currentOrder.forEach((bank, slotIdx) => {
        const el = cardRefs.current[bank];
        if (!el) return;
        const slot = SLOTS[slotIdx];

        tl.to(el, {
          y: slot.poppedY,
          scale: 1.0,
          duration: 0.52 - slotIdx * 0.04,
          ease: 'back.out(1.3)',
        }, '<0.03');
      });

      tl.to(glowRef.current, {
        opacity: 1,
        scale: 1.18,
        duration: 0.5,
        ease: 'power2.out',
      }, '<');
    } else {
      currentOrder.forEach((bank, slotIdx) => {
        const el = cardRefs.current[bank];
        if (!el) return;
        const slot = SLOTS[slotIdx];

        tl.to(el, {
          y: slot.tuckedY,
          scale: slot.scale,
          duration: 0.42 - slotIdx * 0.03,
          ease: 'power3.inOut',
        }, '<0.02');
      });

      tl.to(glowRef.current, {
        opacity: 0.65,
        scale: 1,
        duration: 0.45,
        ease: 'power2.inOut',
      }, '<');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none cursor-pointer ${className}`}
      onClick={handleWalletClick}
    >
      {/* Background Radial Ambient Glow */}
      <div
        ref={glowRef}
        className="absolute w-[600px] sm:w-[700px] h-[500px] sm:h-[580px] rounded-full pointer-events-none transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 44%, transparent 72%)',
          transform: 'translate(-50%, -50%)',
          top: '50%',
          left: '50%',
          opacity: 0.65,
        }}
      />

      {/* Main Wallet Body */}
      <div
        ref={walletBodyRef}
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
        }}
        className="relative w-[440px] sm:w-[500px] md:w-[540px] aspect-[759/512] flex items-center justify-center origin-center"
      >
        {/* 1. Wallet Backside Layer (Z: 0) - Behind Cards */}
        <img
          ref={walletBackRef}
          src={walletBack}
          alt="Wallet Back"
          className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl z-0 pointer-events-none"
        />

        {/* 2. Cards Stack Container (Z: 10) */}
        <div
          ref={cardsContainerRef}
          className="absolute top-[13.6%] left-[3.55%] w-[92.9%] h-[86%] pointer-events-auto z-10"
          style={{
            perspective: 1200,
            transformStyle: 'preserve-3d',
          }}
        >
          {cardOrder.map((bank) => {
            const isThisExpanded = expandedCard === bank;

            return (
              <div
                key={bank}
                ref={(el) => {
                  cardRefs.current[bank] = el;
                }}
                onClick={(e) => handleCardClick(e, bank)}
                onPointerDown={(e) => handlePointerDown(e, bank)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="will-change-transform touch-none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transformStyle: 'preserve-3d',
                  cursor: isOpen ? 'grab' : 'pointer',
                }}
              >
                <BankCard
                  bank={bank}
                  activeLayer={isThisExpanded ? 'front' : 'wallet'}
                  isFlipped={isThisExpanded && isFlipped}
                />
              </div>
            );
          })}
        </div>

        {/* 3. Wallet Frontside Layer (Front Pocket) (Z: 20) - AFTER cards in DOM */}
        <img
          ref={walletFrontRef}
          src={walletFront}
          alt="Wallet Front Pocket"
          onClick={(e) => {
            e.stopPropagation();
            handleWalletClick();
          }}
          onPointerDown={(e) => {
            // Prevent front pocket touches/drags from triggering card drag
            e.stopPropagation();
          }}
          className={`absolute bottom-0 left-0 w-full h-[58%] object-fill z-20 ${
            expandedCard ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
          }`}
        />
      </div>
    </div>
  );
};

export default Wallet;
