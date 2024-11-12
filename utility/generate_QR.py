# import qrcode

# def generate_table_qr_code(table_number):
#     url = f"https://yourminiapp.com/?table_number={table_number}"  # 包含桌号的URL
#     qr = qrcode.make(url)
#     qr.save(f"table_{table_number}.png")
#     print(f"生成桌号 {table_number} 的二维码成功")

# # 生成桌号1到10的二维码
# for i in range(1, 11):
#     generate_table_qr_code(i)


# import requests
# import json

# # 微信小程序的 AppID 和 AppSecret
# APPID = 'wx28ece66c0e5d53ae'
# APPSECRET = 'ea655a81d0d0acecdee0b6df25dc02f7'

# # 获取 access_token
# def get_access_token():
#     url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={APPID}&secret={APPSECRET}"
#     response = requests.get(url)
#     data = response.json()
#     if "access_token" in data:
#         return data['access_token']
#     else:
#         raise Exception("获取 access_token 失败: " + str(data))

# # 生成带参数的小程序码
# def generate_qr_code(table_number, save_path="qrcodes/"):
#     access_token = get_access_token()
#     url = f"https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token={access_token}"
#     headers = {"Content-Type": "application/json"}

#     payload = {
#         "scene": f"table_number={table_number}",
#         "page": "pages/menu/menu",  
#         "check_path": False,
#         "width": 280,
#         "env_version": "release",
#         "auto_color": False,
#         "line_color": {"r": 0, "g": 0, "b": 0},
#         "is_hyaline": False
#     }

#     try:
#         response = requests.post(url, headers=headers, data=json.dumps(payload))
        
#         # 检查响应状态码
#         if response.status_code == 200:
#             # 尝试解析为 JSON，检查是否包含错误代码
#             try:
#                 if "errcode" in response.json():
#                     print("生成小程序码失败:", response.json())
#                 else:
#                     # 如果没有错误码，直接保存二维码图片
#                     file_path = f"{save_path}table_{table_number}_qrcode.png"
#                     with open(file_path, "wb") as f:
#                         f.write(response.content)
#                     print(f"桌号 {table_number} 的小程序码已生成并保存在 {file_path}")
#             except json.JSONDecodeError:
#                 # 如果解析失败，说明返回的是图片二进制内容
#                 file_path = f"{save_path}table_{table_number}_qrcode.png"
#                 with open(file_path, "wb") as f:
#                     f.write(response.content)
#                 print(f"桌号 {table_number} 的小程序码已生成并保存在 {file_path}")
#         else:
#             print("生成小程序码请求失败:", response.status_code, response.text)
#     except requests.RequestException as e:
#         print("请求失败:", e)

# # 示例：生成桌号为1的小程序码
# generate_qr_code(1)


import qrcode

def generate_table_qr_code(table_number):
    # 将桌号作为二维码内容
    qr_content = str(table_number)
    qr = qrcode.make(qr_content)
    
    # 保存二维码文件，命名方式包含桌号
    filename = f"table_{table_number}_qr.png"
    qr.save(filename)
    
    print(f"桌号 {table_number} 的二维码已生成：{filename}")

# 示例：生成桌号为 1 的二维码
generate_table_qr_code(1)
generate_table_qr_code(2)
generate_table_qr_code(3)
generate_table_qr_code(4)
generate_table_qr_code(5)

