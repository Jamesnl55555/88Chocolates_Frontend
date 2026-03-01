import { IconSquareCheckFilled, IconSquareFilled } from "@tabler/icons-react-native";
import React from "react";
import { Pressable } from "react-native";

type Props = {
    isChecked: boolean;
};

export default function CheckboxComponent({ isChecked }: Props) { 
    const [checked, setChecked] = React.useState(isChecked);

    const onToggle = () => {
        setChecked(!checked);
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