import { reportTopics } from "@/consts/reportTopics";
import { ChevronDown, MessageCircleWarning, X } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "../ui/select";

interface UserReportProps {
    expanded?: (expanded: boolean) => void;
    userId: string;
}

interface FormData {
    user_id: string;
    email: string;
    reason: string;
    message: string;
}

export const ReportModal = ({ expanded, userId }: UserReportProps) => {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        trigger,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            user_id: userId,
            email: "",
            reason: "",
            message: "",
        },
        mode: "onChange",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiKey = process.env.EXPO_PUBLIC_FORM_KEY || "";

    const message = watch("message");

    const onSubmit = async (data: FormData) => {
        if (!apiKey) {
            Alert.alert("Error", "API key is missing. Please contact support.");
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: apiKey,
                    user_id: data.user_id,
                    email: data.email,
                    reason: data.reason,
                    message: data.message,
                    from_name: "Reports",
                    subject: "New user report",
                }),
            });

            const result = await response.json();

            if (result.success) {
                reset();
                setIsOpen(false);
                if (expanded) expanded(false);
                Alert.alert("Success", "Report sent successfully!");
            } else {
                Alert.alert("Error", result.message || "Failed to send report. Please try again later.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to send report. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Pressable
                onPress={() => {
                    setIsOpen(true);
                    if (expanded) expanded(true);
                }}
                className="px-4">
                <MessageCircleWarning size={24} color="#9CA3AF" />
            </Pressable>

            <Modal
                visible={isOpen}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView className="flex-1 bg-gradient-to-b from-black to-gray-900">
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800/50">
                        <Pressable
                            onPress={() => {
                                setIsOpen(false);
                                if (expanded) expanded(false);
                            }}
                            className="p-2"
                        >
                            <X size={24} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1 px-4">
                        <View className="pt-6 pb-20">
                            {/* Hidden User ID Field */}
                            <Controller
                                control={control}
                                name="user_id"
                                rules={{ required: "User ID is required" }}
                                render={({ field: { value } }) => (
                                    <TextInput
                                        value={value}
                                        className="hidden"
                                        editable={false}
                                    />
                                )}
                            />
                            {errors.user_id && (
                                <Text className="text-pink-600 text-xs mt-1">{errors.user_id.message}</Text>
                            )}

                            {/* Email Field */}
                            <View className="mb-6">
                                <Text className="text-gray-300 font-medium text-base mb-3">Email</Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    rules={{
                                        required: "Enter your email so we can respond to you",
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Please enter a valid email",
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Enter your email"
                                            placeholderTextColor="#6B7280"
                                            keyboardType="email-address"
                                            autoComplete="off"
                                            className={`bg-gray-800/50 border ${errors.email ? "border-pink-600" : "border-gray-700/50"
                                                } text-white px-4 py-3 rounded-lg text-base`}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <Text className="text-pink-600 text-xs mt-1">{errors.email.message}</Text>
                                )}
                            </View>

                            {/* Reason Field */}
                            <View className="mb-6">
                                <Text className="text-gray-300 font-medium text-base mb-3">Reason</Text>
                                <Controller
                                    control={control}
                                    name="reason"
                                    rules={{ required: "Reason is required" }}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            selectedValue={value}
                                            onValueChange={(val) => {
                                                onChange(val);
                                                trigger("reason");
                                            }}
                                        >
                                            <SelectTrigger
                                                className={`bg-gray-800/50 border ${errors.reason ? "border-pink-600" : "border-gray-700/50"
                                                    } rounded-lg flex-row items-center justify-between px-4 py-3`}
                                            >
                                                <SelectInput
                                                    placeholder="Select reason"
                                                    placeholderTextColor="#6B7280"
                                                    value={value}
                                                    className="flex-1 text-white"
                                                />
                                                <ChevronDown size={24} color="#9CA3AF" />
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop className="bg-black/50 backdrop-blur-sm" />
                                                <SelectContent className="bg-gray-800/50 border border-gray-700/50 rounded-lg">
                                                    {reportTopics.map((topic, index) => (
                                                        <SelectItem
                                                            key={index}
                                                            label={topic}
                                                            value={topic}
                                                            className="px-4 py-3 text-white hover:bg-gradient-to-r hover:from-purple-600/50 hover:to-pink-600/50 active:bg-gradient-to-r active:from-purple-600 active:to-pink-600 border-b border-gray-700/30 last:border-b-0"
                                                        />
                                                    ))}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
                                    )}
                                />
                                {errors.reason && (
                                    <Text className="text-pink-600 text-xs mt-1">{errors.reason.message}</Text>
                                )}
                            </View>

                            {/* Message Field */}
                            <View className="mb-6">
                                <Text className="text-gray-300 font-medium text-base mb-3">Description</Text>
                                <Controller
                                    control={control}
                                    name="message"
                                    rules={{ required: "Description is required" }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Describe the issue..."
                                            placeholderTextColor="#6B7280"
                                            multiline
                                            numberOfLines={3}
                                            textAlignVertical="top"
                                            maxLength={200}
                                            className={`bg-gray-800/50 border ${errors.message ? "border-pink-600" : "border-gray-700/50"
                                                } text-white px-4 py-3 rounded-lg text-base`}
                                        />
                                    )}
                                />
                                <View className="flex-row items-center justify-between mt-1">
                                    {errors.message ? (
                                        <Text className="text-pink-600 text-xs">{errors.message.message}</Text>
                                    ) : (
                                        <Text className="text-gray-400 text-xs">{message?.length || 0} / 200</Text>
                                    )}
                                </View>
                            </View>
                            <Pressable
                                onPress={handleSubmit(onSubmit)}
                                disabled={!isValid || isSubmitting}
                                className={`px-4 py-2 rounded-full w-fit self-end ${isValid && !isSubmitting
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                    : "bg-gray-600"
                                    }`}
                            >
                                <Text className="text-white font-medium text-sm">
                                    {isSubmitting ? "Sending..." : "Send Report"}
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </>
    );
};