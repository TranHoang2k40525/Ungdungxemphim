import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api } from "../../api/API";

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [displayOtp, setDisplayOtp] = useState("");
  const [stage, setStage] = useState("email"); // "email" or "otp"

  const sendOtp = async () => {
    try {
      const response = await api.post("/auth/send-otp", { email });
      console.log("Response from server:", response.data);
      if (response.data.success) {
        setDisplayOtp(response.data.otp);
        Alert.alert("Thành công", `Mã OTP của bạn là: ${response.data.otp}. Vui lòng nhập lại để xác minh!`);
        setStage("otp");
      } else {
        Alert.alert("Lỗi", response.data.message || "Không thể tạo OTP!");
      }
    } catch (error) {
      console.log("Error details:", error.response ? error.response.data : error.message);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo OTP. Vui lòng kiểm tra kết nối hoặc liên hệ hỗ trợ!");
    }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      const response = await api.post("/auth/verify-otp", { email, otp, newPassword });
      if (response.data.success) {
        Alert.alert("Thành công", "Mật khẩu đã được thay đổi!");
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", response.data.message || "Mã OTP không đúng hoặc có lỗi xảy ra!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xác minh OTP. Vui lòng thử lại!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên Mật Khẩu</Text>
      {stage === "email" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Gửi Mã OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.otpText}>Mã OTP: {displayOtp}</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtpAndChangePassword}>
            <Text style={styles.buttonText}>Xác Nhận và Thay Đổi</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
  title: { fontSize: 24, fontWeight: "bold", color: "#ff4d6d", marginBottom: 20 },
  input: { width: "80%", height: 50, borderWidth: 1, borderColor: "#eee", borderRadius: 8, paddingHorizontal: 10, marginVertical: 10 },
  button: { width: "80%", height: 50, backgroundColor: "#ff4d6d", justifyContent: "center", alignItems: "center", borderRadius: 8, marginVertical: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  backButton: { marginTop: 20 },
  backText: { color: "#ff4d6d", fontSize: 16 },
  otpText: { fontSize: 16, color: "#333", marginBottom: 10 },
});
