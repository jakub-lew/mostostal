#version 450
#define VULKAN 100

layout(push_constant) uniform PushConstants {
  mat4 cameraMatrix;
  vec4 inColor;
}
pushConstants;

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 _inColor;
layout(location = 2) in mat4 instanceModel;

layout(location = 0) out vec4 fragColor;

void main() {
  mat4 modelViewMatrix = pushConstants.cameraMatrix * instanceModel;
  gl_Position = modelViewMatrix * vec4(inPosition, 1.0);
  fragColor = pushConstants.inColor;
}
