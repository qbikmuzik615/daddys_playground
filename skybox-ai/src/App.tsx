import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import './style.css';

const games = [
  { name: 'QuizTastic Opposites', path: '../apps/quiztastic-opposites' },
  { name: 'Explain Things with Cats', path: '../apps/explain-things-with-lots-of-tiny-cats' },
  { name: 'Flashcard Maker', path: '../apps/flashcard-maker' },
  { name: 'Gemini Co Drawing', path: '../apps/gemini-co-drawing' },
  { name: 'Image to Code', path: '../apps/image-to-code' },
  { name: 'Magical GIF Maker', path: '../apps/magical-gif-maker' },
  { name: 'p5.js Playground', path: '../apps/p5js-playground' }
];

function Portal({ name, path, index }: { name: string; path: string; index: number }) {
  const x = (index - (games.length - 1) / 2) * 3;
  return (
    <group position={[x, 0, 0]} onClick={() => window.open(path, '_blank')}>
      <mesh>
        <boxGeometry args={[2, 2, 0.5]} />
        <meshStandardMaterial color="#6ad1ff" />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.5} color="black" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 10] }}>
      <ambientLight intensity={0.8} />
      <Sky sunPosition={[100, 20, 100]} />
      <OrbitControls />
      {games.map((game, idx) => (
        <Portal key={game.name} index={idx} {...game} />
      ))}
    </Canvas>
  );
}
