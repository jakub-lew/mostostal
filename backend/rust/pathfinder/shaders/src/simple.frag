#version 450
#define VULKAN 100

layout(location = 0) in vec3 inFragColor;

layout(location = 0) out vec4 fragColor;

void main() { fragColor = vec4(inFragColor, 1.0); }
