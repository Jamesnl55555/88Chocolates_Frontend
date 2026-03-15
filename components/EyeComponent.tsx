import { IconEye, IconEyeOff } from "@tabler/icons-react-native";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
    toggleVisibility: () => void;
    isVisible: boolean;
};
export default function EyeComponent({ toggleVisibility, isVisible }: Props) {
   const [eyeSwitch, setEyeSwitch] = useState(false);

   const onPress = () => {
    setEyeSwitch(!eyeSwitch);
    toggleVisibility();
   };

   return(
    <Pressable onPress={onPress} style={[styles.eyeIcon]}>
    {eyeSwitch ? (
        <IconEye size={24} color="#ac530b" onPress={onPress} />
    ) : (
        <IconEyeOff size={24} color="#ac530b" onPress={onPress} />
    )}
    </Pressable>
   );
}

const styles = StyleSheet.create({
    eyeIcon: {
    padding: 6,
    marginLeft: 6,
    position: 'absolute',
    right: 10
  }
});