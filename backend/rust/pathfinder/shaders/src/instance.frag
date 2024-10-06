#version 450
#define VULKAN 100

layout(location = 0) in vec4 inFragColor;

layout(location = 0) out vec4 fragColor;

void main() { fragColor = inFragColor; }
