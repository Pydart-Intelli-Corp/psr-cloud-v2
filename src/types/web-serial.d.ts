// Web Serial API Type Declarations
// https://wicg.github.io/serial/

interface SerialPort {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  
  forget(): Promise<void>;
  
  getInfo(): SerialPortInfo;
  
  addEventListener(type: 'connect' | 'disconnect', listener: (this: SerialPort, ev: Event) => any): void;
  removeEventListener(type: 'connect' | 'disconnect', listener: (this: SerialPort, ev: Event) => any): void;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
}

interface Serial {
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
  
  addEventListener(type: 'connect' | 'disconnect', listener: (this: Serial, ev: Event) => any): void;
  removeEventListener(type: 'connect' | 'disconnect', listener: (this: Serial, ev: Event) => any): void;
}

interface Navigator {
  readonly serial: Serial;
}
