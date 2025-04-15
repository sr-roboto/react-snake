import React from 'react';
import { useEffect, useState, useRef } from 'react';

const cuadricula = 12;
const posicionViborita = [{ x: 5, y: 5 }];
const posicionInicial = { x: 1, y: 0 };
const velocidad = 8;

function SnakeGame() {
  const [snake, setSnake] = useState(posicionViborita);
  const [direccion, setDireccion] = useState(posicionInicial);
  const [finalizar, setFinalizar] = useState(false);
  const frameCountRef = useRef(0);
  const requestRef = useRef();
  const prevTimeRef = useRef();

  const generarComida = (snake) => {
    try {
      let nuevaComida;
      do {
        nuevaComida = {
          x: Math.floor(Math.random() * cuadricula),
          y: Math.floor(Math.random() * cuadricula),
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
      const nuevaCabeza = {
        x: cabeza.x + direccion.x,
        y: cabeza.y + direccion.y,
      };

      if (
        nuevaCabeza.x < 0 ||
        nuevaCabeza.x >= cuadricula ||
        nuevaCabeza.y < 0 ||
        nuevaCabeza.y >= cuadricula ||
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
        return nuevoCuerpo;
      } else {
        nuevoCuerpo.pop();
        return nuevoCuerpo;
      }
    });
  };

  // Función de animación usando requestAnimationFrame
  const animar = (tiempo) => {
    if (prevTimeRef.current != undefined) {
      const deltaTime = tiempo - prevTimeRef.current;

      // Solo actualizar el juego cuando no esté finalizado
      if (!finalizar) {
        frameCountRef.current += 1;

        // Mover la serpiente cada VELOCIDAD frames
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

  const celdaViborita = (x, y) =>
    snake.some((part) => part.x === x && part.y === y);

  const celdaComida = (x, y) => comida.x === x && comida.y === y;

  return (
    <>
      <div className="flex flex-col items-center mt-10">
        <h1 className="text-2xl font-bold mb-4">🐍 Snake Game</h1>
        {finalizar && (
          <div className="text-red-500 font-bold mb-2">¡Game Over!</div>
        )}
        <div className="grid grid-cols-12 border border-gray-500">
          {Array.from({ length: cuadricula }).flatMap((_, y) =>
            Array.from({ length: cuadricula }).map((_, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-8 h-8 border border-gray-300 
              ${
                celdaViborita(x, y)
                  ? 'bg-green-500'
                  : celdaComida(x, y)
                  ? 'bg-red-500'
                  : 'bg-white'
              }`}
              ></div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default SnakeGame;
