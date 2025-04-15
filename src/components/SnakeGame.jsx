import React from 'react';
import { useEffect, useState, useRef } from 'react';

const cuadricula = 20;
const posicionViborita = [{ x: 10, y: 10 }];
const posicionInicial = { x: 0, y: 1 };

function SnakeGame() {
  const [snake, setSnake] = useState(posicionViborita);
  const [comida, setComida] = useState(posicionViborita);
  const [direccion, setDireccion] = useState(posicionInicial);
  const [finalizar, setFinalizar] = useState(false);
  const intervaloRef = useRef(null);

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

  return (
    <>
      <p>hola</p>
    </>
  );
}

export default SnakeGame;
