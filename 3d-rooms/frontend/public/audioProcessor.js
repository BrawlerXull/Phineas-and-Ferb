class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input && input[0]) {
        const channelData = input[0];
        // console.log(channelData) // Use the first channel
        this.port.postMessage(channelData); // Send audio data to the main thread
      }
      return true; // Keep the processor running
    }
  }
  
  registerProcessor("audio-processor", AudioProcessor);