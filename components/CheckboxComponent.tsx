import { IconSquareCheckFilled, IconSquareFilled } from "@tabler/icons-react-native";
import React, { useEffect } from "react";
import { Pressable } from "react-native";

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
        <Pressable onPress={onToggle} style={{ padding: 8 }}>
            {checked ? (
                <IconSquareCheckFilled size={24} color="#ffffff" />
            ) : (
                <IconSquareFilled size={24} color="#fcfcfc" />
            )}
        </Pressable>
    );
}