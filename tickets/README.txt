把行程相关的 PDF 凭证放进这个文件夹（tickets/），文件名随意。

在 App 的「🎫 票夹」里新增 / 编辑票夹项时，PDF 路径填：
    tickets/你的文件名.pdf
例如：tickets/hotel-rot.pdf 、 tickets/flight-pvg-muc.pdf

支持的类型（category）：机票 / 火车 / 酒店 / 门票 / 其他。

⚠️ 重要：请用「本地服务器」或「部署到 https」的方式访问 index.html，
不要把 index.html 直接双击用 file:// 打开，否则相对路径的 PDF 可能无法正常打开。
本地预览命令（在 index.html 所在目录运行）：
    python -m http.server 8080
然后浏览器 / iPhone 访问 http://<本机IP>:8080/index.html
