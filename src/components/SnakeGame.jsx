import React, { use } from 'react';
import { useEffect, useState, useRef } from 'react';
import telefono from '../assets/telefono-nokia3.png';
import audioFondo from '../assets/beat.mp3';
import audioComida from '../assets/eat.mp3';
import audioPerdiste from '../assets/lose.mp3';

const filas = 20;
const columnas = 36;
const posicionViborita = [{ x: 5, y: 5 }];
const posicionInicial = { x: 1, y: 0 };
let velocidad = 30;

function SnakeGame() {
  const [snake, setSnake] = useState(posicionViborita);
  const [direccion, setDireccion] = useState(posicionInicial);
  const [finalizar, setFinalizar] = useState(false);
  const [score, setScore] = useState(0);
  const frameCountRef = useRef(0);
  const requestRef = useRef();
  const prevTimeRef = useRef();
  const audioRef = useRef(new Audio(audioFondo));
  const audioComidaRef = useRef(new Audio(audioComida));
  const audioPerdisteRef = useRef(new Audio(audioPerdiste));
  const [audioPermitido, setAudioPermitido] = useState(false);

  const habilitarAudio = () => {
    if (!audioPermitido) {
      setAudioPermitido(true);

      // Intentar reproducir todos los audios para "desbloquearlos"
      audioRef.current.play().catch(() => {});
      audioComidaRef.current.volume = 0;
      audioComidaRef.current.play().catch(() => {});
      audioComidaRef.current.pause();
      audioComidaRef.current.volume = 1;

      audioPerdisteRef.current.volume = 0;
      audioPerdisteRef.current.play().catch(() => {});
      audioPerdisteRef.current.pause();
      audioPerdisteRef.current.volume = 1;
    }
  };

  useEffect(() => {
    audioRef.current.loop = true;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log(
          'La reproducción automática fue bloqueada por el navegador'
        );
      });
    }

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  const iniciarMusica = () => {
    audioRef.current.play();
  };

  iniciarMusica();

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

  const reproducirSonidoComida = () => {
    if (audioPermitido) {
      audioComidaRef.current.currentTime = 0;
      audioComidaRef.current.play().catch(() => {});
    }
  };

  const reproducirSonidoPerdiste = () => {
    if (audioPermitido) {
      audioPerdisteRef.current.currentTime = 0;
      audioPerdisteRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    const habilitarAudioConInteraccion = () => {
      habilitarAudio();

      ['click', 'keydown', 'touchstart'].forEach((event) =>
        document.removeEventListener(event, habilitarAudioConInteraccion)
      );
    };

    ['click', 'keydown', 'touchstart'].forEach((event) =>
      document.addEventListener(event, habilitarAudioConInteraccion)
    );

    return () => {
      ['click', 'keydown', 'touchstart'].forEach((event) =>
        document.removeEventListener(event, habilitarAudioConInteraccion)
      );
    };
  }, []);

  const [comida, setComida] = useState(() => generarComida(posicionViborita));

  const moverViborita = () => {
    setSnake((prev) => {
      const cabeza = prev[0];
      let nuevaCabeza = {
        x: cabeza.x + direccion.x,
        y: cabeza.y + direccion.y,
      };

      if (nuevaCabeza.x < 0) nuevaCabeza.x = columnas - 1;
      if (nuevaCabeza.x >= columnas) nuevaCabeza.x = 0;
      if (nuevaCabeza.y < 0) nuevaCabeza.y = filas - 1;
      if (nuevaCabeza.y >= filas) nuevaCabeza.y = 0;

      if (
        prev.some(
          (segmento) =>
            segmento.x === nuevaCabeza.x && segmento.y === nuevaCabeza.y
        )
      ) {
        setFinalizar(true);
        reproducirSonidoPerdiste();
        return prev;
      }

      const nuevoCuerpo = [nuevaCabeza, ...prev];

      if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
        velocidad = Math.max(5, velocidad - 1);
        setComida(generarComida(nuevoCuerpo));
        setScore((score) => score + 10);
        reproducirSonidoComida();
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

  const celdaViborita = (x, y) =>
    snake.some((part) => part.x === x && part.y === y);

  const celdaComida = (x, y) => comida.x === x && comida.y === y;

  return (
    <>
      <div
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
        onClick={habilitarAudio}
      >
        {!audioPermitido && (
          <div className="absolute top-4 right-4 z-20">
            <button
              className="bg-green-700 text-white px-3 py-1 rounded-full text-sm"
              onClick={habilitarAudio}
            >
              🔊 Activar sonido
            </button>
          </div>
        )}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={telefono}
            alt="Teléfono antiguo"
            className="h-full w-full object-contain z-10"
          />
          <div className="absolute flex inset-0 items-center justify-center scale-300">
            <div className="flex flex-col items-center bg-lime-600 p-2 px-14 py-14 rounded">
              <div className="w-full mb-[2%] text-left pl-[5%]">
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
                            ? 'bg-red-600'
                            : ''
                        }`}
                      ></div>
                    ))
                  )}
                </div>
              </div>

              {/* Mensaje de Game Over */}
              {finalizar && (
                <div className="absolute top-[49%] w-full text-center mt-2">
                  <span className="text-black text-xs font-bold">
                    Perdiste paa :(
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
