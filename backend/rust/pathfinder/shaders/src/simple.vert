#version 450
#define VULKAN 100

layout(push_constant) uniform PushConstants {
  mat4 cameraMatrix;
  mat4 modelMatrix;
}
pushConstants;

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inColor;

layout(location = 0) out vec3 fragColor;

void main() {
  mat4 modelViewMatrix = pushConstants.cameraMatrix * pushConstants.modelMatrix;
  gl_Position = modelViewMatrix * vec4(inPosition, 1.0);
  fragColor = inColor;
}
