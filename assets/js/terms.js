/* Master entry list, generated from the glossary source (modal-labs/gpu-glossary). Order = glossary table of contents. */
window.GG_TERMS = [
 {
  "id": "readme",
  "path": "readme",
  "section": "intro",
  "kind": "readme",
  "name": "README",
  "abbr": null,
  "title": "README",
  "lede": "We wrote this glossary to solve a problem we ran into working with GPUs here at Modal: the documentation is fragmented, making it difficult to connect concepts at different levels of the stack, like Streaming Multiprocessor Architecture, Compute Capability, and nvcc compiler flags."
 },
 {
  "id": "device-hardware",
  "path": "device-hardware",
  "section": "device-hardware",
  "kind": "section",
  "name": "Device Hardware",
  "abbr": null,
  "title": "Device Hardware",
  "lede": "These terms and technologies are physical components of the GPU — the \"device\" in NVIDIA's lingo."
 },
 {
  "id": "cuda-device-architecture",
  "path": "device-hardware/cuda-device-architecture",
  "section": "device-hardware",
  "kind": "term",
  "name": "CUDA (Device Architecture)",
  "abbr": null,
  "title": "What is a CUDA Device Architecture?",
  "lede": "CUDA stands for Compute Unified Device Architecture."
 },
 {
  "id": "streaming-multiprocessor",
  "path": "device-hardware/streaming-multiprocessor",
  "section": "device-hardware",
  "kind": "term",
  "name": "Streaming Multiprocessor",
  "abbr": "SM",
  "title": "What is a Streaming Multiprocessor?",
  "lede": "When we program GPUs, we produce sequences of instructions for its Streaming Multiprocessors to carry out."
 },
 {
  "id": "core",
  "path": "device-hardware/core",
  "section": "device-hardware",
  "kind": "term",
  "name": "Core",
  "abbr": null,
  "title": "What is a GPU Core?",
  "lede": "The cores are the primary compute units that make up the Streaming Multiprocessors (SMs)."
 },
 {
  "id": "special-function-unit",
  "path": "device-hardware/special-function-unit",
  "section": "device-hardware",
  "kind": "term",
  "name": "Special Function Unit",
  "abbr": "SFU",
  "title": "What is a Special Function Unit?",
  "lede": "The Special Function Units (SFUs) in Streaming Multiprocessors (SMs) accelerate certain arithmetic operations."
 },
 {
  "id": "load-store-unit",
  "path": "device-hardware/load-store-unit",
  "section": "device-hardware",
  "kind": "term",
  "name": "Load/Store Unit",
  "abbr": "LSU",
  "title": "What is a Load/Store Unit?",
  "lede": "The Load/Store Units (LSUs) dispatch requests to load or store data to the memory subsystems of the GPU."
 },
 {
  "id": "warp-scheduler",
  "path": "device-hardware/warp-scheduler",
  "section": "device-hardware",
  "kind": "term",
  "name": "Warp Scheduler",
  "abbr": null,
  "title": "What is a Warp Scheduler?",
  "lede": "The Warp Scheduler of the Streaming Multiprocessor (SM) decides which group of threads to execute on each clock cycle."
 },
 {
  "id": "cuda-core",
  "path": "device-hardware/cuda-core",
  "section": "device-hardware",
  "kind": "term",
  "name": "CUDA Core",
  "abbr": null,
  "title": "What is a CUDA Core?",
  "lede": "The CUDA Cores are GPU cores that execute scalar arithmetic instructions."
 },
 {
  "id": "tensor-core",
  "path": "device-hardware/tensor-core",
  "section": "device-hardware",
  "kind": "term",
  "name": "Tensor Core",
  "abbr": null,
  "title": "What is a Tensor Core?",
  "lede": "Tensor Cores are GPU cores that operate on entire matrices with each instruction."
 },
 {
  "id": "tensor-memory-accelerator",
  "path": "device-hardware/tensor-memory-accelerator",
  "section": "device-hardware",
  "kind": "term",
  "name": "Tensor Memory Accelerator",
  "abbr": "TMA",
  "title": "What is a Tensor Memory Accelerator?",
  "lede": "Tensor Memory Accelerators are specialized hardware in Hopper and Blackwell architecture GPUs designed to accelerate access to multi-dimensional arrays in GPU RAM."
 },
 {
  "id": "streaming-multiprocessor-architecture",
  "path": "device-hardware/streaming-multiprocessor-architecture",
  "section": "device-hardware",
  "kind": "term",
  "name": "Streaming Multiprocessor Architecture",
  "abbr": null,
  "title": "What is a Streaming Multiprocessor Architecture?",
  "lede": "Streaming Multiprocessors (SMs) are versioned with a particular \"architecture\" that defines their compatibility with Streaming Assembler (SASS) code."
 },
 {
  "id": "texture-processing-cluster",
  "path": "device-hardware/texture-processing-cluster",
  "section": "device-hardware",
  "kind": "term",
  "name": "Texture Processing Cluster",
  "abbr": "TPC",
  "title": "What is a Texture Processing Cluster?",
  "lede": "A Texture Processing Cluster (TPC) is a pair of adjacent Streaming Multiprocessors (SMs)."
 },
 {
  "id": "graphics-processing-cluster",
  "path": "device-hardware/graphics-processing-cluster",
  "section": "device-hardware",
  "kind": "term",
  "name": "Graphics/GPU Processing Cluster",
  "abbr": "GPC",
  "title": "What is a Graphics/GPU Processing Cluster?",
  "lede": "A GPC is a collection of Texture Processing Clusters (TPCs) (themselves groups of Streaming Multiprocessors or SMs) plus a raster engine."
 },
 {
  "id": "register-file",
  "path": "device-hardware/register-file",
  "section": "device-hardware",
  "kind": "term",
  "name": "Register File",
  "abbr": null,
  "title": "What is a Register File?",
  "lede": "The register file of the Streaming Multiprocessor is the primary store of bits in between their manipulation by the cores."
 },
 {
  "id": "l1-data-cache",
  "path": "device-hardware/l1-data-cache",
  "section": "device-hardware",
  "kind": "term",
  "name": "L1 Data Cache",
  "abbr": null,
  "title": "What is the L1 Data Cache?",
  "lede": "The L1 data cache is the private memory of the Streaming Multiprocessor (SM)."
 },
 {
  "id": "tensor-memory",
  "path": "device-hardware/tensor-memory",
  "section": "device-hardware",
  "kind": "term",
  "name": "Tensor Memory",
  "abbr": null,
  "title": "What is Tensor Memory?",
  "lede": "Tensor Memory is a specialized memory in the Streaming Multiprocessor (SM) of certain GPUs, like the B200, for storing the inputs and outputs of Tensor Cores."
 },
 {
  "id": "gpu-ram",
  "path": "device-hardware/gpu-ram",
  "section": "device-hardware",
  "kind": "term",
  "name": "GPU RAM",
  "abbr": null,
  "title": "What is GPU RAM?",
  "lede": "The bottom-level memory of the GPU is a large (many megabytes to gigabytes) memory store that is addressable by all of the GPU's Streaming Multiprocessors (SMs)."
 },
 {
  "id": "device-software",
  "path": "device-software",
  "section": "device-software",
  "kind": "section",
  "name": "Device Software",
  "abbr": null,
  "title": "Device Software",
  "lede": "These terms and technologies are used for software that runs on GPU — the \"device\" in NVIDIA's lingo."
 },
 {
  "id": "cuda-programming-model",
  "path": "device-software/cuda-programming-model",
  "section": "device-software",
  "kind": "term",
  "name": "CUDA (Programming Model)",
  "abbr": null,
  "title": "What is the CUDA Programming Model?",
  "lede": "The CUDA programming model is a programming model for programming massively parallel processors."
 },
 {
  "id": "streaming-assembler",
  "path": "device-software/streaming-assembler",
  "section": "device-software",
  "kind": "term",
  "name": "Streaming ASSembler",
  "abbr": "SASS",
  "title": "What is Streaming Assembler?",
  "lede": "Streaming ASSembler (SASS) is the assembly format for programs running on NVIDIA GPUs."
 },
 {
  "id": "parallel-thread-execution",
  "path": "device-software/parallel-thread-execution",
  "section": "device-software",
  "kind": "term",
  "name": "Parallel Thread eXecution",
  "abbr": "PTX",
  "title": "What is Parallel Thread Execution?",
  "lede": "Parallel Thread eXecution (PTX) is an intermediate representation (IR) for code that will run on a parallel processor (almost always an NVIDIA GPU)."
 },
 {
  "id": "compute-capability",
  "path": "device-software/compute-capability",
  "section": "device-software",
  "kind": "term",
  "name": "Compute Capability",
  "abbr": null,
  "title": "What is Compute Capability?",
  "lede": "Instructions in the Parallel Thread Execution instruction set are compatible with only certain physical GPUs."
 },
 {
  "id": "thread",
  "path": "device-software/thread",
  "section": "device-software",
  "kind": "term",
  "name": "Thread",
  "abbr": null,
  "title": "What is a CUDA Thread?",
  "lede": "A thread of execution (or \"thread\" for short) is the lowest unit of programming for GPUs, the base and atom of the CUDA programming model's thread hierarchy."
 },
 {
  "id": "warp",
  "path": "device-software/warp",
  "section": "device-software",
  "kind": "term",
  "name": "Warp",
  "abbr": null,
  "title": "What is a Warp?",
  "lede": "A warp is a group of threads that are scheduled together and execute in parallel."
 },
 {
  "id": "warpgroup",
  "path": "device-software/warpgroup",
  "section": "device-software",
  "kind": "term",
  "name": "Warpgroup",
  "abbr": null,
  "title": "What is a Warpgroup?",
  "lede": "A warpgroup is a set of four contiguous warps such that the warp-rank of the first warp is a multiple of 4."
 },
 {
  "id": "cooperative-thread-array",
  "path": "device-software/cooperative-thread-array",
  "section": "device-software",
  "kind": "term",
  "name": "Cooperative Thread Array",
  "abbr": null,
  "title": "What is a Cooperative Thread Array?",
  "lede": "A cooperative thread array (CTA) is a collection of threads scheduled onto the same Streaming Multiprocessor (SM)."
 },
 {
  "id": "kernel",
  "path": "device-software/kernel",
  "section": "device-software",
  "kind": "term",
  "name": "Kernel",
  "abbr": null,
  "title": "What is a CUDA Kernel?",
  "lede": "A kernel is the unit of CUDA code that programmers typically write and compose, akin to a procedure or function in languages targeting CPUs."
 },
 {
  "id": "thread-block",
  "path": "device-software/thread-block",
  "section": "device-software",
  "kind": "term",
  "name": "Thread Block",
  "abbr": null,
  "title": "What is a CUDA Thread Block?",
  "lede": "A thread block is a level of the CUDA programming model's thread hierarchy below a grid but above a thread."
 },
 {
  "id": "thread-block-grid",
  "path": "device-software/thread-block-grid",
  "section": "device-software",
  "kind": "term",
  "name": "Thread Block Grid",
  "abbr": null,
  "title": "What is a Thread Block Grid?",
  "lede": "When a CUDA kernel is launched, it creates a collection of threads known as a thread block grid."
 },
 {
  "id": "thread-hierarchy",
  "path": "device-software/thread-hierarchy",
  "section": "device-software",
  "kind": "term",
  "name": "Thread Hierarchy",
  "abbr": null,
  "title": "What is the CUDA Thread Hierarchy?",
  "lede": "The thread hierarchy is a key abstraction of the CUDA programming model, alongside the memory hierarchy."
 },
 {
  "id": "memory-hierarchy",
  "path": "device-software/memory-hierarchy",
  "section": "device-software",
  "kind": "term",
  "name": "Memory Hierarchy",
  "abbr": null,
  "title": "What is the CUDA Memory Hierarchy?",
  "lede": "As part of the CUDA programming model, each level of the thread hierarchy has access to a distinct block of memory shared by all threads in a group at that level: a \"memory hierarchy\"."
 },
 {
  "id": "registers",
  "path": "device-software/registers",
  "section": "device-software",
  "kind": "term",
  "name": "Registers",
  "abbr": null,
  "title": "What are Registers?",
  "lede": "At the lowest level of the memory hierarchy are the registers, which store information manipulated by a single thread."
 },
 {
  "id": "shared-memory",
  "path": "device-software/shared-memory",
  "section": "device-software",
  "kind": "term",
  "name": "Shared Memory",
  "abbr": null,
  "title": "What is Shared Memory?",
  "lede": "Shared memory is the level of the memory hierarchy corresponding to the thread block level of the thread hierarchy in the CUDA programming model."
 },
 {
  "id": "global-memory",
  "path": "device-software/global-memory",
  "section": "device-software",
  "kind": "term",
  "name": "Global Memory",
  "abbr": null,
  "title": "What is Global Memory?",
  "lede": "As part of the CUDA programming model, each level of the thread hierarchy has access to matching memory from the memory hierarchy."
 },
 {
  "id": "cuda-tile-programming-model",
  "path": "device-software/cuda-tile-programming-model",
  "section": "device-software",
  "kind": "term",
  "name": "CUDA Tile Programming Model",
  "abbr": null,
  "title": "What is the CUDA Tile programming model?",
  "lede": "The CUDA Tile programming model is a tile-based programming model targeting NVIDIA GPUs."
 },
 {
  "id": "host-software",
  "path": "host-software",
  "section": "host-software",
  "kind": "section",
  "name": "Host Software",
  "abbr": null,
  "title": "Host Software",
  "lede": "These terms and technologies are used on the CPU (the \"host\" in NVIDIA's lingo) when running GPU programs."
 },
 {
  "id": "cuda-software-platform",
  "path": "host-software/cuda-software-platform",
  "section": "host-software",
  "kind": "term",
  "name": "CUDA (Software Platform)",
  "abbr": null,
  "title": "What is the CUDA Software Platform?",
  "lede": "The CUDA software platform is a collection of software for developing CUDA programs."
 },
 {
  "id": "cuda-c",
  "path": "host-software/cuda-c",
  "section": "host-software",
  "kind": "term",
  "name": "CUDA C++",
  "abbr": null,
  "title": "What is the CUDA C++ programming language?",
  "lede": "CUDA C++ is an implementation of the CUDA programming model as an extension of the C++ programming language."
 },
 {
  "id": "nvidia-gpu-drivers",
  "path": "host-software/nvidia-gpu-drivers",
  "section": "host-software",
  "kind": "term",
  "name": "NVIDIA GPU Drivers",
  "abbr": null,
  "title": "What are the NVIDIA GPU Drivers?",
  "lede": "The NVIDIA GPU drivers mediate the interaction between host programs or the host operating system and the GPU device."
 },
 {
  "id": "nvidia-ko",
  "path": "host-software/nvidia-ko",
  "section": "host-software",
  "kind": "term",
  "name": "nvidia.ko",
  "abbr": null,
  "title": "What is nvidia.ko?",
  "lede": "`nvidia.ko` is a binary kernel module file at the core of the NVIDIA GPU drivers for Linux."
 },
 {
  "id": "cuda-driver-api",
  "path": "host-software/cuda-driver-api",
  "section": "host-software",
  "kind": "term",
  "name": "CUDA Driver API",
  "abbr": null,
  "title": "What is the CUDA Driver API?",
  "lede": "The CUDA Driver API is the userspace component of the NVIDIA CUDA drivers."
 },
 {
  "id": "libcuda",
  "path": "host-software/libcuda",
  "section": "host-software",
  "kind": "term",
  "name": "libcuda.so",
  "abbr": null,
  "title": "What is libcuda.so?",
  "lede": "The typical name for the binary shared object file that implements the CUDA Driver API on Linux systems."
 },
 {
  "id": "nvml",
  "path": "host-software/nvml",
  "section": "host-software",
  "kind": "term",
  "name": "NVIDIA Management Library",
  "abbr": "NVML",
  "title": "What is the NVIDIA Management Library?",
  "lede": "The NVIDIA Management Library (NVML) is used for monitoring and managing the state of NVIDIA GPUs."
 },
 {
  "id": "libnvml",
  "path": "host-software/libnvml",
  "section": "host-software",
  "kind": "term",
  "name": "libnvml.so",
  "abbr": null,
  "title": "What is libnvml.so?",
  "lede": "The typical name for the binary shared object file that implements the features of NVML on Linux systems."
 },
 {
  "id": "nvidia-smi",
  "path": "host-software/nvidia-smi",
  "section": "host-software",
  "kind": "term",
  "name": "nvidia-smi",
  "abbr": null,
  "title": "What is nvidia-smi?",
  "lede": "This command line utility is used to query and manage the state of the GPU exposed by the NVML management libraries."
 },
 {
  "id": "cuda-runtime-api",
  "path": "host-software/cuda-runtime-api",
  "section": "host-software",
  "kind": "term",
  "name": "CUDA Runtime API",
  "abbr": null,
  "title": "What is the CUDA Runtime API?",
  "lede": "The CUDA Runtime API wraps the CUDA Driver API and provides a higher-level API for the same functions."
 },
 {
  "id": "libcudart",
  "path": "host-software/libcudart",
  "section": "host-software",
  "kind": "term",
  "name": "libcudart.so",
  "abbr": null,
  "title": "What is libcudart.so?",
  "lede": "The typical name for the binary shared object file that implements the CUDA Runtime API on Linux systems."
 },
 {
  "id": "cuda-graph",
  "path": "host-software/cuda-graph",
  "section": "host-software",
  "kind": "term",
  "name": "CUDA Graphs",
  "abbr": null,
  "title": "What is a CUDA Graph?",
  "lede": "A CUDA Graph is a graph of kernel launches and other work that can be submitted by the host to the device all at once."
 },
 {
  "id": "nvcc",
  "path": "host-software/nvcc",
  "section": "host-software",
  "kind": "term",
  "name": "NVIDIA CUDA Compiler Driver",
  "abbr": "nvcc",
  "title": "What is the NVIDIA CUDA Compiler Driver?",
  "lede": "The NVIDIA CUDA Compiler Driver is a toolchain for compiling CUDA C/C++ programs."
 },
 {
  "id": "nvrtc",
  "path": "host-software/nvrtc",
  "section": "host-software",
  "kind": "term",
  "name": "NVIDIA Runtime Compiler",
  "abbr": "nvrtc",
  "title": "What is the NVIDIA Runtime Compiler?",
  "lede": "The NVIDIA Runtime Compiler (`nvrtc`) is a runtime compilation library for CUDA C."
 },
 {
  "id": "cupti",
  "path": "host-software/cupti",
  "section": "host-software",
  "kind": "term",
  "name": "NVIDIA CUDA Profiling Tools Interface",
  "abbr": "CUPTI",
  "title": "What is the NVIDIA CUDA Profiling Tools Interface?",
  "lede": "The NVIDIA CUDA Profiling Tools Interface (CUPTI) provides a set of APIs for profiling execution of CUDA C++, PTX, and SASS code on GPUs."
 },
 {
  "id": "nsight-systems",
  "path": "host-software/nsight-systems",
  "section": "host-software",
  "kind": "term",
  "name": "NVIDIA Nsight Systems",
  "abbr": null,
  "title": "What is NVIDIA Nsight Systems?",
  "lede": "NVIDIA Nsight Systems is a performance debugging tool for CUDA C++ programs."
 },
 {
  "id": "cuda-binary-utilities",
  "path": "host-software/cuda-binary-utilities",
  "section": "host-software",
  "kind": "term",
  "name": "CUDA Binary Utilities",
  "abbr": null,
  "title": "What are the CUDA Binary Utilities?",
  "lede": "The CUDA Binary Utilities are a collection of tools for examining the contents of binaries like those output by `nvcc`, the NVIDIA CUDA Compiler driver."
 },
 {
  "id": "cublas",
  "path": "host-software/cublas",
  "section": "host-software",
  "kind": "term",
  "name": "cuBLAS",
  "abbr": null,
  "title": "What is cuBLAS?",
  "lede": "cuBLAS (CUDA Basic Linear Algebra Subroutines) is NVIDIA's high-performance implementation of the Basic Linear Algebra Subprograms (BLAS) standard."
 },
 {
  "id": "cudnn",
  "path": "host-software/cudnn",
  "section": "host-software",
  "kind": "term",
  "name": "cuDNN",
  "abbr": null,
  "title": "What is cuDNN?",
  "lede": "NVIDIA's cuDNN (CUDA Deep Neural Network) is a library of primitives for building GPU-accelerated deep neural networks."
 },
 {
  "id": "cutlass",
  "path": "host-software/cutlass",
  "section": "host-software",
  "kind": "term",
  "name": "CUTLASS",
  "abbr": null,
  "title": "What is CUTLASS?",
  "lede": "CUDA Templates for Linear Algebra Subroutines and Solvers (CUTLASS) is a library of abstractions for implementing high-performance linear algebra in CUDA kernels."
 },
 {
  "id": "cute",
  "path": "host-software/cute",
  "section": "host-software",
  "kind": "term",
  "name": "CuTe",
  "abbr": null,
  "title": "What is CuTe?",
  "lede": "CUDA Templates (CuTe) is a header-only CUDA C++ library within CUTLASS for describing and manipulating tensors of data and threads."
 },
 {
  "id": "cute-dsl",
  "path": "host-software/cute-dsl",
  "section": "host-software",
  "kind": "term",
  "name": "CuTe DSL",
  "abbr": null,
  "title": "What is CuTe DSL?",
  "lede": "CuTe DSL is a Python-based Domain-Specific Language (DSL) for writing and dynamically compiling kernels at high performance and with high developer productivity."
 },
 {
  "id": "cutile-basic",
  "path": "host-software/cutile-basic",
  "section": "host-software",
  "kind": "term",
  "name": "cuTile BASIC",
  "abbr": null,
  "title": "What is cuTile BASIC?",
  "lede": "cuTile BASIC is an implementation of the CUDA Tile programming model in the BASIC programming language."
 },
 {
  "id": "perf",
  "path": "perf",
  "section": "perf",
  "kind": "section",
  "name": "Performance",
  "abbr": null,
  "title": "Performance",
  "lede": "GPUs are used when the performance of an application is inadequate on general-purpose hardware."
 },
 {
  "id": "performance-bottleneck",
  "path": "perf/performance-bottleneck",
  "section": "perf",
  "kind": "term",
  "name": "Performance Bottleneck",
  "abbr": null,
  "title": "What is a performance bottleneck?",
  "lede": "The literal neck of a bottle limits the rate at which liquid can be poured; a metaphorical performance bottleneck in a system limits the rate at which tasks can be completed."
 },
 {
  "id": "roofline-model",
  "path": "perf/roofline-model",
  "section": "perf",
  "kind": "term",
  "name": "Roofline Model",
  "abbr": null,
  "title": "What is the roofline model?",
  "lede": "The roofline model is a simplified, visual model of performance used to quickly determine whether a program is bound by memory bandwidth or arithmetic bandwidth."
 },
 {
  "id": "compute-bound",
  "path": "perf/compute-bound",
  "section": "perf",
  "kind": "term",
  "name": "Compute-bound",
  "abbr": null,
  "title": "What does it mean to be compute-bound?",
  "lede": "Kernels that are compute-bound are limited by the arithmetic bandwidth of the CUDA Cores or Tensor Cores."
 },
 {
  "id": "memory-bound",
  "path": "perf/memory-bound",
  "section": "perf",
  "kind": "term",
  "name": "Memory-bound",
  "abbr": null,
  "title": "What does it mean to be memory-bound?",
  "lede": "Kernels that are memory-bound are limited by the memory bandwidth of the GPU."
 },
 {
  "id": "arithmetic-intensity",
  "path": "perf/arithmetic-intensity",
  "section": "perf",
  "kind": "term",
  "name": "Arithmetic Intensity",
  "abbr": null,
  "title": "What is arithmetic intensity?",
  "lede": "Arithmetic intensity is the ratio of arithmetic operations to memory operations in a kernel."
 },
 {
  "id": "overhead",
  "path": "perf/overhead",
  "section": "perf",
  "kind": "term",
  "name": "Overhead",
  "abbr": null,
  "title": "What is overhead?",
  "lede": "Overhead latency is the time spent with no useful work being done."
 },
 {
  "id": "littles-law",
  "path": "perf/littles-law",
  "section": "perf",
  "kind": "term",
  "name": "Little's Law",
  "abbr": null,
  "title": "What is Little's Law?",
  "lede": "Little's Law establishes the amount of concurrency required to fully hide latency with throughput."
 },
 {
  "id": "memory-bandwidth",
  "path": "perf/memory-bandwidth",
  "section": "perf",
  "kind": "term",
  "name": "Memory Bandwidth",
  "abbr": null,
  "title": "What is memory bandwidth?",
  "lede": "Memory bandwidth is the maximum rate at which data can be transferred between different levels of the memory hierarchy."
 },
 {
  "id": "arithmetic-bandwidth",
  "path": "perf/arithmetic-bandwidth",
  "section": "perf",
  "kind": "term",
  "name": "Arithmetic Bandwidth",
  "abbr": null,
  "title": "What is arithmetic bandwidth?",
  "lede": "Arithmetic bandwidth is the peak rate at which arithmetic work can be performed by a system."
 },
 {
  "id": "latency-hiding",
  "path": "perf/latency-hiding",
  "section": "perf",
  "kind": "term",
  "name": "Latency Hiding",
  "abbr": null,
  "title": "What is latency hiding?",
  "lede": "Latency hiding is a strategy to mask long-latency operations by running many of them concurrently."
 },
 {
  "id": "warp-execution-state",
  "path": "perf/warp-execution-state",
  "section": "perf",
  "kind": "term",
  "name": "Warp Execution State",
  "abbr": null,
  "title": "What is warp execution state?",
  "lede": "The state of the warps running a kernel is described with a number of non-exclusive adjectives: active, stalled, eligible, and selected."
 },
 {
  "id": "active-cycle",
  "path": "perf/active-cycle",
  "section": "perf",
  "kind": "term",
  "name": "Active Cycle",
  "abbr": null,
  "title": "What is an active cycle?",
  "lede": "An active cycle is a clock cycle in which a Streaming Multiprocessor has at least one active warp resident."
 },
 {
  "id": "occupancy",
  "path": "perf/occupancy",
  "section": "perf",
  "kind": "term",
  "name": "Occupancy",
  "abbr": null,
  "title": "What is occupancy?",
  "lede": "Occupancy is the ratio of the active warps to the maximum number of active warps on a device."
 },
 {
  "id": "pipe-utilization",
  "path": "perf/pipe-utilization",
  "section": "perf",
  "kind": "term",
  "name": "Pipe Utilization",
  "abbr": null,
  "title": "What is pipe utilization?",
  "lede": "Pipe utilization measures how effectively a kernel uses the execution resources within each Streaming Multiprocessor (SM)."
 },
 {
  "id": "peak-rate",
  "path": "perf/peak-rate",
  "section": "perf",
  "kind": "term",
  "name": "Peak Rate",
  "abbr": null,
  "title": "What is peak rate?",
  "lede": "Peak rate is the theoretical maximum rate at which a hardware system can complete work."
 },
 {
  "id": "issue-efficiency",
  "path": "perf/issue-efficiency",
  "section": "perf",
  "kind": "term",
  "name": "Issue Efficiency",
  "abbr": null,
  "title": "What is issue efficiency?",
  "lede": "Issue efficiency measures how effectively the warp scheduler keeps execution pipes busy by issuing instructions from eligible warps."
 },
 {
  "id": "streaming-multiprocessor-utilization",
  "path": "perf/streaming-multiprocessor-utilization",
  "section": "perf",
  "kind": "term",
  "name": "Streaming Multiprocessor Utilization",
  "abbr": null,
  "title": "What is SM utilization?",
  "lede": "SM utilization measures the percentage of time that Streaming Multiprocessors (SMs) are executing instructions."
 },
 {
  "id": "warp-divergence",
  "path": "perf/warp-divergence",
  "section": "perf",
  "kind": "term",
  "name": "Warp Divergence",
  "abbr": null,
  "title": "What is warp divergence?",
  "lede": "Warp divergence occurs when threads within a warp take different execution paths due to control flow statements."
 },
 {
  "id": "scoreboard-stall",
  "path": "perf/scoreboard-stall",
  "section": "perf",
  "kind": "term",
  "name": "Scoreboard Stall",
  "abbr": null,
  "title": "What is a scoreboard stall?",
  "lede": "A scoreboard stall occurs when an instruction cannot be issued due to a dependency on the result of a prior instruction."
 },
 {
  "id": "branch-efficiency",
  "path": "perf/branch-efficiency",
  "section": "perf",
  "kind": "term",
  "name": "Branch Efficiency",
  "abbr": null,
  "title": "What is branch efficiency?",
  "lede": "Branch efficiency measures how often all threads in a warp take the same execution path when encountering conditional statements."
 },
 {
  "id": "memory-coalescing",
  "path": "perf/memory-coalescing",
  "section": "perf",
  "kind": "term",
  "name": "Memory Coalescing",
  "abbr": null,
  "title": "What is Memory Coalescing?",
  "lede": "Memory coalescing is a hardware technique to improve the utilization of memory bandwidth by servicing multiple logical memory reads in a single physical memory access."
 },
 {
  "id": "bank-conflict",
  "path": "perf/bank-conflict",
  "section": "perf",
  "kind": "term",
  "name": "Bank Conflict",
  "abbr": null,
  "title": "What is a bank conflict?",
  "lede": "When multiple threads in a warp simultaneously request memory within the same bank in shared memory but across distinct addresses, we say there is a bank conflict."
 },
 {
  "id": "register-pressure",
  "path": "perf/register-pressure",
  "section": "perf",
  "kind": "term",
  "name": "Register Pressure",
  "abbr": null,
  "title": "What is register pressure?",
  "lede": "Register pressure is a colorful term used when the register file is a bottleneck."
 },
 {
  "id": "contributors",
  "path": "contributors",
  "section": "outro",
  "kind": "contributors",
  "name": "Contributors",
  "abbr": null,
  "title": "Contributors",
  "lede": "This list is incomplete; you can help by expanding it."
 }
];
