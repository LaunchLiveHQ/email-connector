import { EmailDriver } from "./driver.js";
import { DriverType, DriverCredentials, SendingServer } from "@emailconnector/config-schema";
export declare function createDriver(driverType: DriverType, credentials: DriverCredentials): EmailDriver;
export declare function createDriverFromServer(server: SendingServer): EmailDriver;
//# sourceMappingURL=factory.d.ts.map