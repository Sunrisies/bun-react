import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/portTable")({
  component: PortTable,
});

interface PortInfo {
  port: number;
  protocol: "TCP" | "UDP" | "TCP/UDP";
  service: string;
  description: string;
  category: string;
}

const PORT_LIST: PortInfo[] = [
  // 系统端口 (0-1023)
  { port: 20, protocol: "TCP", service: "FTP-DATA", description: "FTP数据传输", category: "文件传输" },
  { port: 21, protocol: "TCP", service: "FTP", description: "FTP控制连接", category: "文件传输" },
  { port: 22, protocol: "TCP", service: "SSH", description: "安全Shell", category: "远程管理" },
  { port: 23, protocol: "TCP", service: "Telnet", description: "远程登录", category: "远程管理" },
  { port: 25, protocol: "TCP", service: "SMTP", description: "简单邮件传输协议", category: "邮件服务" },
  { port: 53, protocol: "TCP/UDP", service: "DNS", description: "域名系统", category: "网络服务" },
  { port: 67, protocol: "UDP", service: "DHCP", description: "动态主机配置协议(服务端)", category: "网络服务" },
  { port: 68, protocol: "UDP", service: "DHCP", description: "动态主机配置协议(客户端)", category: "网络服务" },
  { port: 69, protocol: "UDP", service: "TFTP", description: "简单文件传输协议", category: "文件传输" },
  { port: 80, protocol: "TCP", service: "HTTP", description: "超文本传输协议", category: "网络服务" },
  { port: 110, protocol: "TCP", service: "POP3", description: "邮局协议版本3", category: "邮件服务" },
  { port: 123, protocol: "UDP", service: "NTP", description: "网络时间协议", category: "网络服务" },
  { port: 143, protocol: "TCP", service: "IMAP", description: "互联网消息访问协议", category: "邮件服务" },
  { port: 161, protocol: "UDP", service: "SNMP", description: "简单网络管理协议", category: "网络管理" },
  { port: 162, protocol: "UDP", service: "SNMP Trap", description: "SNMP陷阱", category: "网络管理" },
  { port: 389, protocol: "TCP", service: "LDAP", description: "轻型目录访问协议", category: "目录服务" },
  { port: 443, protocol: "TCP", service: "HTTPS", description: "安全超文本传输协议", category: "网络服务" },
  { port: 445, protocol: "TCP", service: "SMB", description: "服务器消息块", category: "文件共享" },
  { port: 465, protocol: "TCP", service: "SMTPS", description: "加密的SMTP", category: "邮件服务" },
  { port: 514, protocol: "UDP", service: "Syslog", description: "系统日志", category: "系统服务" },
  { port: 636, protocol: "TCP", service: "LDAPS", description: "安全LDAP", category: "目录服务" },
  { port: 993, protocol: "TCP", service: "IMAPS", description: "安全IMAP", category: "邮件服务" },
  { port: 995, protocol: "TCP", service: "POP3S", description: "安全POP3", category: "邮件服务" },

  // 注册端口 (1024-49151)
  { port: 1080, protocol: "TCP", service: "SOCKS", description: "SOCKS代理", category: "代理服务" },
  { port: 1433, protocol: "TCP", service: "MSSQL", description: "Microsoft SQL Server", category: "数据库" },
  { port: 1521, protocol: "TCP", service: "Oracle", description: "Oracle数据库", category: "数据库" },
  { port: 2049, protocol: "TCP/UDP", service: "NFS", description: "网络文件系统", category: "文件系统" },
  { port: 3306, protocol: "TCP", service: "MySQL", description: "MySQL数据库", category: "数据库" },
  { port: 3389, protocol: "TCP", service: "RDP", description: "远程桌面协议", category: "远程管理" },
  { port: 5432, protocol: "TCP", service: "PostgreSQL", description: "PostgreSQL数据库", category: "数据库" },
  { port: 5900, protocol: "TCP", service: "VNC", description: "虚拟网络计算", category: "远程管理" },
  { port: 6379, protocol: "TCP", service: "Redis", description: "Redis数据库", category: "数据库" },
  { port: 8080, protocol: "TCP", service: "HTTP-ALT", description: "替代HTTP端口", category: "网络服务" },
  { port: 8443, protocol: "TCP", service: "HTTPS-ALT", description: "替代HTTPS端口", category: "网络服务" },
  { port: 27017, protocol: "TCP", service: "MongoDB", description: "MongoDB数据库", category: "数据库" },

  // 常见应用端口
  { port: 1194, protocol: "UDP", service: "OpenVPN", description: "开源VPN服务", category: "VPN服务" },
  { port: 1701, protocol: "UDP", service: "L2TP", description: "第二层隧道协议", category: "VPN服务" },
  { port: 1723, protocol: "TCP", service: "PPTP", description: "点对点隧道协议", category: "VPN服务" },
  { port: 3128, protocol: "TCP", service: "Squid", description: "Squid代理服务", category: "代理服务" },
  { port: 5060, protocol: "TCP/UDP", service: "SIP", description: "会话发起协议", category: "通信服务" },
  { port: 5222, protocol: "TCP", service: "XMPP", description: "可扩展通讯和表示协议", category: "通信服务" },
  { port: 6660, protocol: "TCP", service: "IRC", description: "互联网中继聊天", category: "通信服务" },
  { port: 8000, protocol: "TCP", service: "HTTP-ALT", description: "替代HTTP端口", category: "网络服务" },
  { port: 9001, protocol: "TCP", service: "Tor", description: "Tor代理服务", category: "代理服务" },
  { port: 9418, protocol: "TCP", service: "Git", description: "Git协议", category: "版本控制" }
];

function PortTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  const categories = ["全部", ...Array.from(new Set(PORT_LIST.map(port => port.category)))];

  const filteredPorts = PORT_LIST.filter(port => {
    const matchSearch = 
      port.port.toString().includes(searchTerm) ||
      port.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.category.toLowerCase().includes(searchTerm.toLowerCase());

    return selectedCategory === "全部" ? matchSearch : matchSearch && port.category === selectedCategory;
  });

  const getProtocolColor = (protocol: string): string => {
    switch (protocol) {
      case "TCP": return "text-blue-500";
      case "UDP": return "text-green-500";
      case "TCP/UDP": return "text-purple-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>端口对照表</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 搜索和过滤 */}
            <div className="flex gap-4 items-center">
              <Input
                placeholder="搜索端口、协议或服务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* 端口网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPorts.map((port) => (
                <div
                  key={`${port.port}-${port.protocol}`}
                  className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-mono font-bold">{port.port}</span>
                    <span className={`font-mono ${getProtocolColor(port.protocol)}`}>
                      {port.protocol}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">{port.service}</span>
                      <span className="text-sm text-gray-500 ml-2">({port.category})</span>
                    </div>
                    <p className="text-sm text-gray-600">{port.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                提示：此表列出了最常见的网络服务端口。TCP和UDP是两种主要的传输层协议，某些服务可能同时使用这两种协议。系统端口范围为0-1023，注册端口范围为1024-49151。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}