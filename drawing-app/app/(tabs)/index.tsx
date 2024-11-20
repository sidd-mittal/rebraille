import React, { useState } from 'react';
import { StyleSheet, View, PanResponder, Button } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function HomeScreen() {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [highlightedPaths, setHighlightedPaths] = useState<Set<number>>(new Set());

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (tool === "pencil") {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M ${locationX} ${locationY}`);
      } else if (tool === "eraser") {
        // When eraser is initiated, reset the highlighted paths
        setHighlightedPaths(new Set());
      }
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (tool === "pencil") {
        setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
      } else if (tool === "eraser") {
        // While eraser is moving, keep highlighting paths that are being crossed
        const touchedPaths = findPathsToHighlight(locationX, locationY, paths);
        touchedPaths.forEach((index) => highlightedPaths.add(index)); // Keep adding to highlighted set
        setHighlightedPaths(new Set(highlightedPaths)); // Force re-render by creating a new set
      }
    },
    onPanResponderRelease: () => {
      if (tool === "pencil" && currentPath) {
        setPaths((prevPaths) => [...prevPaths, currentPath]);
        setCurrentPath("");
      } else if (tool === "eraser") {
        // Erase all highlighted paths on release
        setPaths((prevPaths) => prevPaths.filter((_, index) => !highlightedPaths.has(index)));
        setHighlightedPaths(new Set()); // Clear highlighted paths after erasing
      }
    },
  });

  // Helper function to find paths that intersect with the current eraser stroke
  const findPathsToHighlight = (x: number, y: number, paths: string[]): number[] => {
    const threshold = 20; // Distance threshold for eraser detection
    let touchedPaths: number[] = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (isPathTouched(x, y, path, threshold)) {
        touchedPaths.push(i);
      }
    }
    return touchedPaths;
  };

  // Function to check if the eraser stroke is close enough to a path
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
              stroke={highlightedPaths.has(index) ? "red" : "black"} // Highlight in red if it's in the eraser path
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
