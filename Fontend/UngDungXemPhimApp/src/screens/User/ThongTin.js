import React, { useContext, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { UserContext } from "../../contexts/UserContext";
import icon from '../../assets/images/icon.png';
import { api } from "../../api/API";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ThongTin({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserInfo();
    } else {
      setLoading(false);
      Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập");
    }
  }, [user?.id]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get(`/users/${user.id}`, { headers });
      if (response.data) {
        const mappedData = {
          UserID: response.data.id || response.data.UserID,
          FullName: response.data.name || response.data.FullName,
          Phone: response.data.phone || response.data.Phone,
          Email: response.data.email || response.data.Email,
          Birthday: response.data.birthday || response.data.Birthday,
          Avatar: response.data.avatar || response.data.Avatar
        };
        setUserInfo(mappedData);
        setEditedInfo(mappedData); // Khởi tạo giá trị chỉnh sửa từ dữ liệu hiện tại
      }
    } catch (error) {
      console.error("Lỗi chi tiết khi lấy thông tin người dùng:", error);
      Alert.alert("Lỗi", `Không thể lấy thông tin: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

 const handleSave = async () => {
  try {
    setLoading(true);

    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Lỗi", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Chuẩn hóa dữ liệu trước khi gửi
    const payload = {
      Name: editedInfo.FullName || "",
      Phone: editedInfo.Phone || "",
      Email: editedInfo.Email || "",
      Birthday: editedInfo.Birthday
        ? new Date(editedInfo.Birthday).toISOString().split("T")[0] // YYYY-MM-DD
        : null,
    };

    console.log("PUT Request URL:", `${api.defaults.baseURL}/users/profile`);
    console.log("PUT Request Headers:", headers);
    console.log("PUT Request Payload:", payload);

    const response = await api.put(`/users/profile`, payload, { headers });

    if (response.data) {
      // Chuẩn hóa dữ liệu trả về từ API
      const updatedData = {
        UserID: response.data.id || response.data.UserID,
        FullName: response.data.name || response.data.FullName || "",
        Phone: response.data.phone || response.data.Phone || "",
        Email: response.data.email || response.data.Email || "",
        Birthday: response.data.birthday || response.data.Birthday || null,
        Avatar: response.data.avatar || null
      };

      setUserInfo(updatedData);
      setEditedInfo(updatedData);
      setUser({ ...user, name: updatedData.FullName });

      setIsEditing(false);
      Alert.alert("Thành công", "Thông tin đã được cập nhật!");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin:", error.response || error);
    Alert.alert(
      "Lỗi",
      `Không thể cập nhật thông tin: ${error.response?.status || ""} - ${error.response?.data?.message || error.message}`
    );
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    setEditedInfo(userInfo); // Khôi phục giá trị ban đầu
    setIsEditing(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || editedInfo.Birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setEditedInfo({ ...editedInfo, Birthday: currentDate });
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL' || dateString === null || dateString === undefined || dateString === '') return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    return date.toLocaleDateString('vi-VN');
  };

  const displayValue = (value) => {
    return (value && value !== 'NULL' && value !== null && value !== undefined && value !== '') ? value.toString() : "Chưa cập nhật";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>Không tải được thông tin. Thử làm mới.</Text>
        <TouchableOpacity onPress={fetchUserInfo} style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: '#ff4d6d', fontWeight: 'bold' }}>Làm mới</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color="#ff4d6d" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Thông tin tài khoản</Text>
          <TouchableOpacity 
            onPress={isEditing ? handleCancel : handleEdit}
            style={styles.editBtn}
          >
            <Icon name={isEditing ? "times" : "edit"} size={20} color="#ff4d6d" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Image 
              source={userInfo.Avatar ? { uri: `data:image/png;base64,${userInfo.Avatar}` } : icon} 
              style={styles.avatar} 
            />
            <Text style={styles.userId}>ID: {displayValue(userInfo?.UserID)}</Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="user" size={20} color="#ff4d6d" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Họ và tên</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedInfo.FullName || ''}
                      onChangeText={(text) => setEditedInfo({ ...editedInfo, FullName: text })}
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{displayValue(userInfo?.FullName)}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#ff4d6d" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedInfo.Phone || ''}
                      onChangeText={(text) => setEditedInfo({ ...editedInfo, Phone: text })}
                      placeholder="Nhập số điện thoại"
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{displayValue(userInfo?.Phone)}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="envelope" size={20} color="#ff4d6d" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedInfo.Email || ''}
                      onChangeText={(text) => setEditedInfo({ ...editedInfo, Email: text })}
                      placeholder="Nhập email"
                      keyboardType="email-address"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{displayValue(userInfo?.Email)}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="birthday-cake" size={20} color="#ff4d6d" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày sinh</Text>
                  {isEditing ? (
                    <>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <TextInput
                          style={styles.input}
                          value={editedInfo.Birthday ? new Date(editedInfo.Birthday).toLocaleDateString('vi-VN') : ''}
                          editable={false}
                          placeholder="Chọn ngày sinh"
                        />
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={editedInfo.Birthday ? new Date(editedInfo.Birthday) : new Date()}
                          mode="date"
                          display="default"
                          onChange={onDateChange}
                        />
                      )}
                    </>
                  ) : (
                    <Text style={styles.infoValue}>{formatDate(userInfo?.Birthday)}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={handleSave}
              >
                <Icon name="save" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.refreshBtn]}
                onPress={handleCancel}
              >
                <Icon name="times" size={18} color="#ff4d6d" />
                <Text style={[styles.actionBtnText, styles.refreshBtnText]}>Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
          {!isEditing && (
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={handleEdit}
              >
                <Icon name="edit" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Chỉnh sửa thông tin</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.refreshBtn]}
                onPress={fetchUserInfo}
              >
                <Icon name="refresh" size={18} color="#ff4d6d" />
                <Text style={[styles.actionBtnText, styles.refreshBtnText]}>Làm mới</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5"
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 }
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center"
  },
  backBtn: {
    padding: 8
  },
  editBtn: {
    padding: 8
  },
  scrollView: {
    flex: 1
  },
  avatarSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 30,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#ff4d6d"
  },
  userId: {
    backgroundColor: "#ff4d6d",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontWeight: "bold",
    fontSize: 14
  },
  infoContainer: {
    paddingHorizontal: 16
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  infoIcon: {
    marginRight: 16,
    width: 20
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff'
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30
  },
  actionBtn: {
    backgroundColor: "#ff4d6d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#ff4d6d",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  refreshBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff4d6d"
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8
  },
  refreshBtnText: {
    color: "#ff4d6d"
  }
});
