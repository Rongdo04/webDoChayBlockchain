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

const MongoDBSchemaDiagram = () => {
  const initialNodes = [
    // User Collection
    {
      id: "user",
      type: "input",
      position: { x: 100, y: 100 },
      data: {
        label: (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-blue-800 text-center mb-2">
              📄 users
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">name:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">email:</span>
                <span className="text-gray-600">String (unique)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">password:</span>
                <span className="text-gray-600">String (hashed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">avatar:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">role:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">isActive:</span>
                <span className="text-gray-600">Boolean</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">favorites:</span>
                <span className="text-gray-600">[ObjectId] → recipes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="text-xs text-blue-700">
                <strong>Indexes:</strong> email, role, isActive
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // Recipe Collection
    {
      id: "recipe",
      type: "default",
      position: { x: 400, y: 100 },
      data: {
        label: (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-green-800 text-center mb-2">
              🍽️ recipes
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-green-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">title:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">slug:</span>
                <span className="text-gray-600">String (unique)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">summary:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">content:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">ingredients:</span>
                <span className="text-gray-600">[Embedded]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">steps:</span>
                <span className="text-gray-600">[Embedded]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">tags:</span>
                <span className="text-gray-600">[String]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">category:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">prepTime:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">cookTime:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">servings:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">images:</span>
                <span className="text-gray-600">[ObjectId] → media</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">status:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">ratingAvg:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">ratingCount:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">authorId:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-green-200">
              <div className="text-xs text-green-700">
                <strong>Indexes:</strong> slug, status, authorId, tags, category
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // Post Collection
    {
      id: "post",
      type: "default",
      position: { x: 700, y: 100 },
      data: {
        label: (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-purple-800 text-center mb-2">
              📝 posts
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-purple-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">content:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">tag:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">status:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">userId:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">likes:</span>
                <span className="text-gray-600">[ObjectId] → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">likesCount:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">commentsCount:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">moderatedBy:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-purple-200">
              <div className="text-xs text-purple-700">
                <strong>Indexes:</strong> userId, status, tag, createdAt
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // Comment Collection
    {
      id: "comment",
      type: "default",
      position: { x: 400, y: 400 },
      data: {
        label: (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-orange-800 text-center mb-2">
              💬 comments
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-orange-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">content:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">rating:</span>
                <span className="text-gray-600">Number (1-5)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">status:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">recipeId:</span>
                <span className="text-gray-600">ObjectId → recipes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">userId:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">parentId:</span>
                <span className="text-gray-600">ObjectId → comments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">moderatedBy:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-orange-200">
              <div className="text-xs text-orange-700">
                <strong>Indexes:</strong> recipeId, userId, status, parentId
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // Media Collection
    {
      id: "media",
      type: "default",
      position: { x: 100, y: 400 },
      data: {
        label: (
          <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-pink-800 text-center mb-2">
              📁 media
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-pink-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">filename:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">originalName:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">mimeType:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">size:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">type:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">url:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">thumbnailUrl:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">alt:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">tags:</span>
                <span className="text-gray-600">[String]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">uploaderId:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">storageType:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">status:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">usageCount:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-pink-200">
              <div className="text-xs text-pink-700">
                <strong>Indexes:</strong> uploaderId, type, status, tags
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // Report Collection
    {
      id: "report",
      type: "default",
      position: { x: 700, y: 400 },
      data: {
        label: (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-red-800 text-center mb-2">
              🚨 reports
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-red-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">targetType:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">targetId:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">reason:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">description:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">reporterId:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">status:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">reviewedBy:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">adminNotes:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">resolution:</span>
                <span className="text-gray-600">Embedded Object</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-red-200">
              <div className="text-xs text-red-700">
                <strong>Indexes:</strong> reporterId, status, targetType,
                targetId
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // AuditLog Collection
    {
      id: "auditlog",
      type: "default",
      position: { x: 100, y: 700 },
      data: {
        label: (
          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-indigo-800 text-center mb-2">
              📋 auditlogs
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-indigo-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">action:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">entityType:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">entityId:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">userId:</span>
                <span className="text-gray-600">ObjectId → users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">userEmail:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">userRole:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">details:</span>
                <span className="text-gray-600">Mixed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">metadata:</span>
                <span className="text-gray-600">Mixed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">ipAddress:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">userAgent:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-indigo-200">
              <div className="text-xs text-indigo-700">
                <strong>Indexes:</strong> action, userId, entityType, entityId
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // Settings Collection
    {
      id: "settings",
      type: "default",
      position: { x: 400, y: 700 },
      data: {
        label: (
          <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-teal-800 text-center mb-2">
              ⚙️ settings
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-teal-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-600">siteTitle:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-600">siteDesc:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-600">brand:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-600">policy:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-600">_singleton:</span>
                <span className="text-gray-600">Boolean (unique)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-teal-200">
              <div className="text-xs text-teal-700">
                <strong>Indexes:</strong> _singleton
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },

    // Taxonomy Collection
    {
      id: "taxonomy",
      type: "default",
      position: { x: 700, y: 700 },
      data: {
        label: (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 min-w-[240px]">
            <div className="font-bold text-yellow-800 text-center mb-2">
              🏷️ taxonomies
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-yellow-600">_id:</span>
                <span className="text-gray-600">ObjectId</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">name:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">type:</span>
                <span className="text-gray-600">String (enum)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">slug:</span>
                <span className="text-gray-600">String (required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">description:</span>
                <span className="text-gray-600">String</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">usageCount:</span>
                <span className="text-gray-600">Number</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">isActive:</span>
                <span className="text-gray-600">Boolean</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">createdAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">updatedAt:</span>
                <span className="text-gray-600">Date</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-yellow-200">
              <div className="text-xs text-yellow-700">
                <strong>Indexes:</strong> name+type, slug+type, type, isActive
              </div>
            </div>
          </div>
        ),
      },
      style: {
        background: "transparent",
        border: "none",
        width: "auto",
        height: "auto",
      },
    },
  ];

  const initialEdges = [
    // User to Recipe (1:N)
    {
      id: "user-recipe",
      source: "user",
      target: "recipe",
      type: "straight",
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      label: "authorId",
      labelStyle: { fill: "#3b82f6", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // User to Post (1:N)
    {
      id: "user-post",
      source: "user",
      target: "post",
      type: "straight",
      style: { stroke: "#8b5cf6", strokeWidth: 2 },
      label: "userId",
      labelStyle: { fill: "#8b5cf6", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // User to Comment (1:N)
    {
      id: "user-comment",
      source: "user",
      target: "comment",
      type: "straight",
      style: { stroke: "#f97316", strokeWidth: 2 },
      label: "userId",
      labelStyle: { fill: "#f97316", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // User to Media (1:N)
    {
      id: "user-media",
      source: "user",
      target: "media",
      type: "straight",
      style: { stroke: "#ec4899", strokeWidth: 2 },
      label: "uploaderId",
      labelStyle: { fill: "#ec4899", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // User to Report (1:N)
    {
      id: "user-report",
      source: "user",
      target: "report",
      type: "straight",
      style: { stroke: "#ef4444", strokeWidth: 2 },
      label: "reporterId",
      labelStyle: { fill: "#ef4444", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // Recipe to Comment (1:N)
    {
      id: "recipe-comment",
      source: "recipe",
      target: "comment",
      type: "straight",
      style: { stroke: "#10b981", strokeWidth: 2 },
      label: "recipeId",
      labelStyle: { fill: "#10b981", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // Recipe to Media (N:M)
    {
      id: "recipe-media",
      source: "recipe",
      target: "media",
      type: "straight",
      style: { stroke: "#06b6d4", strokeWidth: 2, strokeDasharray: "5,5" },
      label: "images[]",
      labelStyle: { fill: "#06b6d4", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // User to Recipe (N:M for favorites)
    {
      id: "user-favorites",
      source: "user",
      target: "recipe",
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2, strokeDasharray: "3,3" },
      label: "favorites[]",
      labelStyle: { fill: "#6366f1", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // Comment to Comment (Self-reference for replies)
    {
      id: "comment-reply",
      source: "comment",
      target: "comment",
      type: "smoothstep",
      style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "3,3" },
      label: "parentId",
      labelStyle: { fill: "#f59e0b", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // User to Post (N:M for likes)
    {
      id: "user-post-likes",
      source: "user",
      target: "post",
      type: "smoothstep",
      style: { stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "3,3" },
      label: "likes[]",
      labelStyle: { fill: "#8b5cf6", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // User to AuditLog (1:N)
    {
      id: "user-auditlog",
      source: "user",
      target: "auditlog",
      type: "straight",
      style: { stroke: "#6366f1", strokeWidth: 2 },
      label: "userId",
      labelStyle: { fill: "#6366f1", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    },

    // Recipe to Taxonomy (N:M via tags/category)
    {
      id: "recipe-taxonomy",
      source: "recipe",
      target: "taxonomy",
      type: "smoothstep",
      style: { stroke: "#eab308", strokeWidth: 2, strokeDasharray: "3,3" },
      label: "tags[]/category",
      labelStyle: { fill: "#eab308", fontWeight: "bold" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
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
          MongoDB Schema Diagram
        </h1>
        <p className="text-gray-600">
          Sơ đồ cấu trúc database MongoDB cho hệ thống quản lý công thức nấu ăn
          chay
        </p>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            <strong>Collections:</strong> users, recipes, posts, comments,
            media, reports, auditlogs, settings, taxonomies
          </p>
          <p>
            <strong>Features:</strong> Embedded documents, ObjectId references,
            Indexes, Validation, Audit logging, Singleton pattern
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-140px)]">
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
              if (n.id === "user") return "#3b82f6";
              if (n.id === "recipe") return "#10b981";
              if (n.id === "post") return "#8b5cf6";
              if (n.id === "comment") return "#f97316";
              if (n.id === "media") return "#ec4899";
              if (n.id === "report") return "#ef4444";
              if (n.id === "auditlog") return "#6366f1";
              if (n.id === "settings") return "#14b8a6";
              if (n.id === "taxonomy") return "#eab308";
              return "#6b7280";
            }}
            nodeColor={(n) => {
              if (n.id === "user") return "#dbeafe";
              if (n.id === "recipe") return "#dcfce7";
              if (n.id === "post") return "#f3e8ff";
              if (n.id === "comment") return "#fed7aa";
              if (n.id === "media") return "#fce7f3";
              if (n.id === "report") return "#fee2e2";
              if (n.id === "auditlog") return "#e0e7ff";
              if (n.id === "settings") return "#ccfbf1";
              if (n.id === "taxonomy") return "#fef3c7";
              return "#f3f4f6";
            }}
            nodeBorderRadius={2}
          />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
        <h3 className="font-bold text-sm mb-2">Chú thích MongoDB:</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-300 bg-blue-50"></div>
            <span>users (Người dùng)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-300 bg-green-50"></div>
            <span>recipes (Công thức)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-purple-300 bg-purple-50"></div>
            <span>posts (Bài viết)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-orange-300 bg-orange-50"></div>
            <span>comments (Bình luận)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-pink-300 bg-pink-50"></div>
            <span>media (Tệp đa phương tiện)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-red-300 bg-red-50"></div>
            <span>reports (Báo cáo)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-indigo-300 bg-indigo-50"></div>
            <span>auditlogs (Nhật ký)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-teal-300 bg-teal-50"></div>
            <span>settings (Cài đặt)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-yellow-300 bg-yellow-50"></div>
            <span>taxonomies (Phân loại)</span>
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span>ObjectId Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cyan-500 border-dashed border border-cyan-500"></div>
              <span>Array Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-amber-500 border-dashed border border-amber-500"></div>
              <span>Self Reference</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MongoDBSchemaDiagram;
