import React, { useEffect, useState, useRef } from 'react';
import telefono from '../assets/telefono-nokia3.png';
import audioFondo from '../assets/beat.mp3';
import audioComida from '../assets/eat.mp3';
import audioPerdiste from '../assets/lose.mp3';

const CONFIG = {
  filas: 20,
  columnas: 36,
  velocidadInicial: 30,
  posicionInicial: { x: 1, y: 0 },
  posicionViborita: [{ x: 5, y: 5 }],
};

const generarComida = (snake) => {
  let nuevaComida;
  do {
    nuevaComida = {
      x: Math.floor(Math.random() * CONFIG.columnas),
      y: Math.floor(Math.random() * CONFIG.filas),
    };
  } while (
    snake.some(
      (segmento) => segmento.x === nuevaComida.x && segmento.y === nuevaComida.y
    )
  );
  return nuevaComida;
};

function SnakeGame() {
  const [snake, setSnake] = useState(CONFIG.posicionViborita);
  const [direccion, setDireccion] = useState(CONFIG.posicionInicial);
  const [finalizar, setFinalizar] = useState(false);
  const [score, setScore] = useState(0);
  const [comida, setComida] = useState(() =>
    generarComida(CONFIG.posicionViborita)
  );
  const [audioPermitido, setAudioPermitido] = useState(false);

  const frameCountRef = useRef(0);
  const requestRef = useRef();
  const prevTimeRef = useRef();
  const velocidadRef = useRef(CONFIG.velocidadInicial);

  const audioRefs = {
    fondo: useRef(new Audio(audioFondo)),
    comida: useRef(new Audio(audioComida)),
    perdiste: useRef(new Audio(audioPerdiste)),
  };

  useEffect(() => {
    configurarAudio();
    return () => detenerAudio();
  }, []);

  useEffect(() => {
    const manejarTeclado = (e) => cambiarDireccion(e.key);
    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [direccion]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(requestRef.current);
  }, [direccion, finalizar]);

  const configurarAudio = () => {
    audioRefs.fondo.current.loop = true;
    audioRefs.fondo.current.play().catch(() => {});
  };

  const detenerAudio = () => {
    Object.values(audioRefs).forEach((audio) => {
      audio.current.pause();
      audio.current.currentTime = 0;
    });
  };

  const habilitarAudio = () => {
    if (!audioPermitido) {
      setAudioPermitido(true);
      Object.values(audioRefs).forEach((audio) => {
        audio.current.play().catch(() => {});
        audio.current.pause();
      });
    }
  };

  const cambiarDireccion = (tecla) => {
    const direcciones = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const nuevaDireccion = direcciones[tecla];
    if (
      nuevaDireccion &&
      (nuevaDireccion.x !== -direccion.x || nuevaDireccion.y !== -direccion.y)
    ) {
      setDireccion(nuevaDireccion);
    }
  };

  const moverViborita = () => {
    setSnake((prev) => {
      const cabeza = prev[0];
      const nuevaCabeza = {
        x: (cabeza.x + direccion.x + CONFIG.columnas) % CONFIG.columnas,
        y: (cabeza.y + direccion.y + CONFIG.filas) % CONFIG.filas,
      };

      if (
        prev.some(
          (segmento) =>
            segmento.x === nuevaCabeza.x && segmento.y === nuevaCabeza.y
        )
      ) {
        setFinalizar(true);
        reproducirSonido('perdiste');
        return prev;
      }

      const nuevoCuerpo = [nuevaCabeza, ...prev];
      if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
        velocidadRef.current = Math.max(5, velocidadRef.current - 1);
        setComida(generarComida(nuevoCuerpo));
        setScore((score) => score + 10);
        reproducirSonido('comida');
      } else {
        nuevoCuerpo.pop();
      }
      return nuevoCuerpo;
    });
  };

  const reproducirSonido = (tipo) => {
    if (audioPermitido) {
      const audio = audioRefs[tipo].current;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const animar = (tiempo) => {
    if (prevTimeRef.current != null) {
      const deltaTime = tiempo - prevTimeRef.current;
      if (!finalizar && frameCountRef.current >= velocidadRef.current) {
        moverViborita();
        frameCountRef.current = 0;
      }
      frameCountRef.current += deltaTime;
    }
    prevTimeRef.current = tiempo;
    requestRef.current = requestAnimationFrame(animar);
  };

  const celdaViborita = (x, y) =>
    snake.some((part) => part.x === x && part.y === y);
  const celdaComida = (x, y) => comida.x === x && comida.y === y;

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      onClick={habilitarAudio}
    >
      {!audioPermitido && (
        <button className="absolute top-4 right-4 bg-green-700 text-white px-3 py-1 rounded-full text-sm">
          🔊 Activar sonido
        </button>
      )}
      <img
        src={telefono}
        alt="Teléfono antiguo"
        className="h-full w-full object-contain z-10"
      />
      <div className="absolute flex inset-0 items-center justify-center scale-300">
        <div className="flex flex-col items-center bg-lime-600 p-2 px-14 py-14 rounded">
          <div className="text-black font-mono text-sm font-bold mb-2">
            {score.toString().padStart(4, '0')}
          </div>
          <div
            className="grid border-2 border-black"
            style={{ gridTemplateColumns: `repeat(${CONFIG.columnas}, 1fr)` }}
          >
            {Array.from({ length: CONFIG.filas }).flatMap((_, y) =>
              Array.from({ length: CONFIG.columnas }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-2 h-2 ${
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
          {finalizar && (
            <div className="absolute top-[49%] text-black text-xs font-bold">
              Perdiste paa :(
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SnakeGame;
