import React, { useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";

const UseCaseDiagram = () => {
  const initialNodes = [
    // Actors
    {
      id: "user",
      type: "input",
      position: { x: 50, y: 100 },
      data: { label: "User\n(Người dùng)" },
      style: {
        background: "#e1f5fe",
        border: "2px solid #0277bd",
        borderRadius: "50%",
        width: 120,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        textAlign: "center",
      },
    },
    {
      id: "admin",
      type: "input",
      position: { x: 50, y: 300 },
      data: { label: "Admin\n(Quản trị viên)" },
      style: {
        background: "#e8f5e8",
        border: "2px solid #2e7d32",
        borderRadius: "50%",
        width: 120,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        textAlign: "center",
      },
    },
    {
      id: "guest",
      type: "input",
      position: { x: 50, y: 500 },
      data: { label: "Guest\n(Khách truy cập)" },
      style: {
        background: "#fff3e0",
        border: "2px solid #f57c00",
        borderRadius: "50%",
        width: 120,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        textAlign: "center",
      },
    },

    // Use Cases - Authentication
    {
      id: "register",
      position: { x: 300, y: 50 },
      data: { label: "Đăng ký tài khoản" },
      style: {
        background: "#f3e5f5",
        border: "1px solid #9c27b0",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "login",
      position: { x: 300, y: 130 },
      data: { label: "Đăng nhập" },
      style: {
        background: "#f3e5f5",
        border: "1px solid #9c27b0",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },

    // Use Cases - Recipe Management
    {
      id: "search-recipes",
      position: { x: 500, y: 50 },
      data: { label: "Tìm kiếm công thức" },
      style: {
        background: "#e3f2fd",
        border: "1px solid #1976d2",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "view-recipe",
      position: { x: 500, y: 130 },
      data: { label: "Xem chi tiết công thức" },
      style: {
        background: "#e3f2fd",
        border: "1px solid #1976d2",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "submit-recipe",
      position: { x: 500, y: 210 },
      data: { label: "Đăng công thức" },
      style: {
        background: "#e3f2fd",
        border: "1px solid #1976d2",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "manage-profile",
      position: { x: 500, y: 290 },
      data: { label: "Quản lý hồ sơ" },
      style: {
        background: "#e3f2fd",
        border: "1px solid #1976d2",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },

    // Use Cases - Community Features
    {
      id: "create-post",
      position: { x: 700, y: 50 },
      data: { label: "Tạo bài viết" },
      style: {
        background: "#e8f5e8",
        border: "1px solid #388e3c",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "comment-rate",
      position: { x: 700, y: 130 },
      data: { label: "Bình luận & Đánh giá" },
      style: {
        background: "#e8f5e8",
        border: "1px solid #388e3c",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "favorite",
      position: { x: 700, y: 210 },
      data: { label: "Lưu yêu thích" },
      style: {
        background: "#e8f5e8",
        border: "1px solid #388e3c",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "report-content",
      position: { x: 700, y: 290 },
      data: { label: "Báo cáo nội dung" },
      style: {
        background: "#e8f5e8",
        border: "1px solid #388e3c",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },

    // Use Cases - Admin Functions
    {
      id: "manage-users",
      position: { x: 300, y: 400 },
      data: { label: "Quản lý người dùng" },
      style: {
        background: "#fff3e0",
        border: "1px solid #f57c00",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "moderate-content",
      position: { x: 500, y: 400 },
      data: { label: "Duyệt nội dung" },
      style: {
        background: "#fff3e0",
        border: "1px solid #f57c00",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "manage-reports",
      position: { x: 700, y: 400 },
      data: { label: "Quản lý báo cáo" },
      style: {
        background: "#fff3e0",
        border: "1px solid #f57c00",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "manage-media",
      position: { x: 300, y: 480 },
      data: { label: "Quản lý Media" },
      style: {
        background: "#fff3e0",
        border: "1px solid #f57c00",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "view-analytics",
      position: { x: 500, y: 480 },
      data: { label: "Xem thống kê" },
      style: {
        background: "#fff3e0",
        border: "1px solid #f57c00",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },

    // Use Cases - Guest Functions
    {
      id: "browse-recipes",
      position: { x: 300, y: 600 },
      data: { label: "Duyệt công thức" },
      style: {
        background: "#fce4ec",
        border: "1px solid #c2185b",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
    {
      id: "view-community",
      position: { x: 500, y: 600 },
      data: { label: "Xem cộng đồng" },
      style: {
        background: "#fce4ec",
        border: "1px solid #c2185b",
        borderRadius: "20px",
        width: 150,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        textAlign: "center",
      },
    },
  ];

  const initialEdges = [
    // User connections
    {
      id: "user-register",
      source: "user",
      target: "register",
      type: "straight",
    },
    { id: "user-login", source: "user", target: "login", type: "straight" },
    {
      id: "user-search",
      source: "user",
      target: "search-recipes",
      type: "straight",
    },
    {
      id: "user-view",
      source: "user",
      target: "view-recipe",
      type: "straight",
    },
    {
      id: "user-submit",
      source: "user",
      target: "submit-recipe",
      type: "straight",
    },
    {
      id: "user-profile",
      source: "user",
      target: "manage-profile",
      type: "straight",
    },
    {
      id: "user-create-post",
      source: "user",
      target: "create-post",
      type: "straight",
    },
    {
      id: "user-comment-rate",
      source: "user",
      target: "comment-rate",
      type: "straight",
    },
    {
      id: "user-favorite",
      source: "user",
      target: "favorite",
      type: "straight",
    },
    {
      id: "user-report",
      source: "user",
      target: "report-content",
      type: "straight",
    },

    // Admin connections
    { id: "admin-login", source: "admin", target: "login", type: "straight" },
    {
      id: "admin-manage-users",
      source: "admin",
      target: "manage-users",
      type: "straight",
    },
    {
      id: "admin-moderate",
      source: "admin",
      target: "moderate-content",
      type: "straight",
    },
    {
      id: "admin-reports",
      source: "admin",
      target: "manage-reports",
      type: "straight",
    },
    {
      id: "admin-media",
      source: "admin",
      target: "manage-media",
      type: "straight",
    },
    {
      id: "admin-analytics",
      source: "admin",
      target: "view-analytics",
      type: "straight",
    },
    {
      id: "admin-search",
      source: "admin",
      target: "search-recipes",
      type: "straight",
    },
    {
      id: "admin-view",
      source: "admin",
      target: "view-recipe",
      type: "straight",
    },

    // Guest connections
    {
      id: "guest-browse",
      source: "guest",
      target: "browse-recipes",
      type: "straight",
    },
    {
      id: "guest-community",
      source: "guest",
      target: "view-community",
      type: "straight",
    },
    {
      id: "guest-search",
      source: "guest",
      target: "search-recipes",
      type: "straight",
    },
    {
      id: "guest-view",
      source: "guest",
      target: "view-recipe",
      type: "straight",
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm border-b">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Sơ đồ Use Case - Website Hướng Dẫn Nấu Món Ăn Chay
        </h1>
        <p className="text-gray-600">
          Sơ đồ thể hiện các actors và use cases chính của hệ thống quản lý công
          thức nấu ăn chay
        </p>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            <strong>Chức năng chính:</strong> Quản lý công thức, Cộng đồng chia
            sẻ, Bình luận & đánh giá, Quản trị hệ thống
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-120px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === "input") return "#0041d0";
              return "#ff0072";
            }}
            nodeColor={(n) => {
              if (n.type === "input") return "#e1f5fe";
              return "#f3e5f5";
            }}
            nodeBorderRadius={2}
          />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
        <h3 className="font-bold text-sm mb-2">Chú thích:</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-100"></div>
            <span>User (Người dùng)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-green-600 bg-green-100"></div>
            <span>Admin (Quản trị viên)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-orange-600 bg-orange-100"></div>
            <span>Guest (Khách truy cập)</span>
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 rounded border border-purple-600 bg-purple-100"></div>
              <span>Xác thực</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 rounded border border-blue-600 bg-blue-100"></div>
              <span>Quản lý công thức</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 rounded border border-green-600 bg-green-100"></div>
              <span>Cộng đồng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 rounded border border-orange-600 bg-orange-100"></div>
              <span>Quản trị</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 rounded border border-pink-600 bg-pink-100"></div>
              <span>Khách truy cập</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseDiagram;
