import React, { use } from 'react';
import { useEffect, useState, useRef } from 'react';
import telefono from '../assets/telefono-nokia3.png';

const filas = 10;
const columnas = 18;
const posicionViborita = [{ x: 5, y: 5 }];
const posicionInicial = { x: 1, y: 0 };
let velocidad = 20;

function SnakeGame() {
  const [snake, setSnake] = useState(posicionViborita);
  const [direccion, setDireccion] = useState(posicionInicial);
  const [finalizar, setFinalizar] = useState(false);
  const [score, setScore] = useState(0);
  const frameCountRef = useRef(0);
  const requestRef = useRef();
  const prevTimeRef = useRef();

  const generarComida = (snake) => {
    try {
      let nuevaComida;
      do {
        nuevaComida = {
          x: Math.floor(Math.random() * columnas),
          y: Math.floor(Math.random() * filas),
        };
      } while (
        snake.some(
          (segmento) =>
            segmento.x === nuevaComida.x && segmento.y === nuevaComida.y
        )
      );
      return nuevaComida;
    } catch (error) {
      console.error('Error generando comida:', error);
      return { x: 0, y: 0 };
    }
  };

  const [comida, setComida] = useState(() => generarComida(posicionViborita));

  const moverViborita = () => {
    setSnake((prev) => {
      const cabeza = prev[0];
      let nuevaCabeza = {
        x: cabeza.x + direccion.x,
        y: cabeza.y + direccion.y,
      };

      // Si la cabeza sale por un borde, aparece por el otro lado
      if (nuevaCabeza.x < 0) nuevaCabeza.x = columnas - 1;
      if (nuevaCabeza.x >= columnas) nuevaCabeza.x = 0;
      if (nuevaCabeza.y < 0) nuevaCabeza.y = filas - 1;
      if (nuevaCabeza.y >= filas) nuevaCabeza.y = 0;

      // Solo perdemos si nos chocamos con nuestro cuerpo
      if (
        prev.some(
          (segmento) =>
            segmento.x === nuevaCabeza.x && segmento.y === nuevaCabeza.y
        )
      ) {
        setFinalizar(true);
        return prev;
      }

      const nuevoCuerpo = [nuevaCabeza, ...prev];

      if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
        setComida(generarComida(nuevoCuerpo));
        setScore((score) => score + 10);
        return nuevoCuerpo;
      } else {
        nuevoCuerpo.pop();
        return nuevoCuerpo;
      }
    });
  };

  const animar = (tiempo) => {
    if (prevTimeRef.current != undefined) {
      const deltaTime = tiempo - prevTimeRef.current;

      if (!finalizar) {
        frameCountRef.current += 1;

        if (frameCountRef.current >= velocidad) {
          moverViborita();
          frameCountRef.current = 0;
        }
      }
    }

    prevTimeRef.current = tiempo;
    requestRef.current = requestAnimationFrame(animar);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(requestRef.current);
  }, [direccion, finalizar]);

  useEffect(() => {
    const entradaTeclado = (e) => {
      const tecla = e.key;
      if (tecla === 'ArrowUp' && direccion.y !== 1)
        setDireccion({ x: 0, y: -1 });
      if (tecla === 'ArrowDown' && direccion.y !== -1)
        setDireccion({ x: 0, y: 1 });
      if (tecla === 'ArrowLeft' && direccion.x !== 1)
        setDireccion({ x: -1, y: 0 });
      if (tecla === 'ArrowRight' && direccion.x !== -1)
        setDireccion({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', entradaTeclado);
    return () => window.removeEventListener('keydown', entradaTeclado);
  }, [direccion]);

  useEffect(() => {
    if (score >= 20) {
      velocidad += -2;
    }
  }, [score]);

  const celdaViborita = (x, y) =>
    snake.some((part) => part.x === x && part.y === y);

  const celdaComida = (x, y) => comida.x === x && comida.y === y;

  return (
    <>
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={telefono}
            alt="Teléfono antiguo"
            className="h-full object-contain z-10"
          />
          <div className="absolute flex items-center justify-center scale-600">
            <div className="flex flex-col items-center bg-lime-600 p-2 px-14 rounded">
              <div className="w-full mb-1 text-left">
                <div className="text-black font-mono text-sm font-bold">
                  {score.toString().padStart(4, '0')}
                </div>
                <div className="w-full h-1 bg-black mb-2"></div>
              </div>

              {/* Cuadrícula del juego */}
              <div className="border-2 border-black">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${filas}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: filas }).flatMap((_, y) =>
                    Array.from({ length: columnas }).map((_, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`w-2 h-2 
                        ${
                          celdaViborita(x, y)
                            ? 'bg-black'
                            : celdaComida(x, y)
                            ? 'bg-black'
                            : ''
                        }`}
                      ></div>
                    ))
                  )}
                </div>
              </div>

              {/* Mensaje de Game Over */}
              {finalizar && (
                <div className="absolute top-[45%] w-full text-center mt-2">
                  <span className="text-black text-xs font-bold">
                    Perdiste paa
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SnakeGame;
