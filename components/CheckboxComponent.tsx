import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

type Props = {
    isChecked: boolean;
    onPress?: () => void;
};

export default function CheckboxComponent({ isChecked, onPress }: Props) { 
    const [checked, setChecked] = React.useState(isChecked);

    useEffect(() => {
        setChecked(isChecked);
    }, [isChecked]);

    const onToggle = () => {
        setChecked(!checked);
        if(onPress) onPress();

    };


    return (
        <Pressable onPress={onToggle} style={{ padding: 6 }}>
            <Svg width={23} height={23} viewBox="0 0 24 24">
                <Rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="4"
                    ry="4"
                    fill="#D9D9D9"
                    stroke="#411C0E"
                    strokeWidth={1}
                />
                {checked && (
                    <Path
                        d="M9 12l2 2 4-4"
                        fill="none"
                        stroke="#411C0E"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                )}
            </Svg>
        </Pressable>
    );
}