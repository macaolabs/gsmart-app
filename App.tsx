/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState, type PropsWithChildren} from 'react';
import io from 'socket.io-client';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Dimensions,
} from 'react-native';
import Matter from 'matter-js';
import {GameEngine} from 'react-native-game-engine';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Box from './src/components/Box';

const socket = io('https://realtime-g2g4oq25qa-uc.a.run.app');

const {width, height} = Dimensions.get('screen');
const boxSize = Math.trunc(Math.max(width, height) * 0.075);
const engine = Matter.Engine.create({enableSleeping: false});
const world = engine.world;
const initialBox = Matter.Bodies.rectangle(
  width / 2,
  height / 2,
  boxSize,
  boxSize,
);
const floor = Matter.Bodies.rectangle(
  width / 2,
  height - boxSize / 2,
  width,
  boxSize,
  {isStatic: true},
);
Matter.World.add(world, [initialBox, floor]);

const Physics = (entities, {time}) => {
  let engine = entities['physics'].engine;
  Matter.Engine.update(engine, time.delta);
  return entities;
};

let boxIds = 0;

const CreateBox = (entities, {touches, screen}) => {
  let world = entities['physics'].world;
  let boxSize = Math.trunc(Math.max(screen.width, screen.height) * 0.075);
  touches
    .filter(t => t.type === 'press')
    .forEach(t => {
      let body = Matter.Bodies.rectangle(
        t.event.pageX,
        t.event.pageY,
        boxSize,
        boxSize,
        {
          frictionAir: 0.021,
          restitution: 1.0,
        },
      );

      Matter.World.add(world, [body]);

      entities[++boxIds] = {
        body: body,
        size: [boxSize, boxSize],
        color: boxIds % 2 == 0 ? 'pink' : '#B8E986',
        renderer: Box,
      };
    });
  return entities;
};

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [pong, setPong] = useState<any>({});
  const [ping, setPing] = useState<any>({});
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('s:status', (message: any) => {
      setPong({
        ...message,
        time: new Date().getTime(),
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  const sendPing = () => {
    const ping = {
      message: 'ping',
      time: new Date().getTime(),
    };
    setPing(ping);
    socket.emit('c:move', ping);
  };

  return (
    <>
      <GameEngine
        style={styles.container}
        systems={[Physics, CreateBox]}
        entities={{
          physics: {engine: engine, world: world},
          floor: {
            body: floor,
            size: [width, boxSize],
            color: 'green',
            renderer: Box,
          },
          initialBox: {
            body: initialBox,
            size: [boxSize, boxSize],
            color: 'red',
            renderer: Box,
          },
        }}>
        <StatusBar hidden={true} />
      </GameEngine>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
