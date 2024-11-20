import React, { useState } from 'react';
import { StyleSheet, View, PanResponder, Button } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function HomeScreen() {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [highlightedPaths, setHighlightedPaths] = useState<Set<number>>(new Set());
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]); // Track points for straight line detection
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (tool === "pencil") {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M ${locationX} ${locationY}`);
        setPoints([{ x: locationX, y: locationY }]); // Reset points
      } else if (tool === "eraser") {
        setHighlightedPaths(new Set());
      }

      if (timer) {
        clearTimeout(timer); // Clear previous timer
      }

      // Start a new timer to check for holding the straight line
      setTimer(setTimeout(() => {
        if (points.length > 2) {
          straightenLine();
        }
      }, 1000)); // 1 second hold to straighten
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (tool === "pencil") {
        setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
        setPoints((prevPoints) => [...prevPoints, { x: locationX, y: locationY }]);

        if (points.length > 1) {
          const lastPoint = points[points.length - 1];
          const secondLastPoint = points[points.length - 2];
          const angle = calculateAngle(lastPoint, secondLastPoint, { x: locationX, y: locationY });

          // Check if the line is close to being straight
          if (Math.abs(angle) < 10 || Math.abs(angle - 180) < 10) {
            if (!timer) {
              setTimer(setTimeout(() => straightenLine(), 1000)); // Hold the line for a second
            }
          }
        }
      } else if (tool === "eraser") {
        const touchedPaths = findPathsToHighlight(locationX, locationY, paths);
        touchedPaths.forEach((index) => highlightedPaths.add(index)); // Keep adding to highlighted set
        setHighlightedPaths(new Set(highlightedPaths)); // Force re-render by creating a new set
      }
    },
    onPanResponderRelease: () => {
      if (tool === "pencil" && currentPath) {
        setPaths((prevPaths) => [...prevPaths, currentPath]);
        setCurrentPath(""); // Reset current path after release
        setPoints([]); // Clear points after release to avoid issues in next stroke
      } else if (tool === "eraser") {
        setPaths((prevPaths) => prevPaths.filter((_, index) => !highlightedPaths.has(index)));
        setHighlightedPaths(new Set());
      }

      // Clear the timer when release happens
      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
    },
  });

  const calculateAngle = (p1: { x: number, y: number }, p2: { x: number, y: number }, p3: { x: number, y: number }) => {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    const angle = (angle2 - angle1) * (180 / Math.PI); // Convert to degrees
    return angle;
  };

  const straightenLine = () => {
    if (points.length > 1) {
      const start = points[0];
      const end = points[points.length - 1];

      // Check if line is approximately horizontal or vertical and snap it accordingly
      if (Math.abs(start.y - end.y) < 10) {
        // Horizontal line
        setCurrentPath(`M ${start.x} ${start.y} L ${end.x} ${start.y}`);
      } else if (Math.abs(start.x - end.x) < 10) {
        // Vertical line
        setCurrentPath(`M ${start.x} ${start.y} L ${start.x} ${end.y}`);
      } else {
        // Diagonal line (or any other case, snap to diagonal)
        setCurrentPath(`M ${start.x} ${start.y} L ${end.x} ${end.y}`);
      }
    }
  };

  const findPathsToHighlight = (x: number, y: number, paths: string[]): number[] => {
    const threshold = 20;
    let touchedPaths: number[] = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (isPathTouched(x, y, path, threshold)) {
        touchedPaths.push(i);
      }
    }
    return touchedPaths;
  };

  const isPathTouched = (x: number, y: number, path: string, threshold: number): boolean => {
    const commands = path.split(" ");
    for (let i = 0; i < commands.length; i += 3) {
      const px = parseFloat(commands[i + 1]);
      const py = parseFloat(commands[i + 2]);
      if (Math.hypot(px - x, py - y) < threshold) {
        return true;
      }
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.drawingArea} {...panResponder.panHandlers}>
        <Svg style={styles.svg}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke={highlightedPaths.has(index) ? "red" : "black"}
              strokeWidth={3}
              fill="none"
            />
          ))}
          {currentPath && <Path d={currentPath} stroke="black" strokeWidth={3} fill="none" />}
        </Svg>
      </View>
      <View style={styles.toolBar}>
        <Button
          title="Pencil"
          color={tool === "pencil" ? "blue" : "black"}
          onPress={() => setTool("pencil")}
        />
        <Button
          title="Eraser"
          color={tool === "eraser" ? "blue" : "black"}
          onPress={() => setTool("eraser")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  drawingArea: {
    flex: 1,
  },
  svg: {
    flex: 1,
  },
  toolBar: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});
