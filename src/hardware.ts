import * as fs from "fs";
import * as os from "os";
import * as _ from "lodash";

const sanitizeSize = (size: number): string => {
	// standardize on GB
	return Math.ceil(size / 1024 ** 3).toString();
};

export const getIntsWithMacAddresses = () => {
	return _.compact(
		_.map(os.networkInterfaces(), (obj, iface) => {
			if (iface.startsWith("resin-") || iface.startsWith("veth") || iface.startsWith("balena")) {
				return null;
			}
			return obj[0].internal ? null : [iface, obj[0].mac];
		})
	);
};

export const hasRTC = () => {
	try {
		fs.lstatSync("/proc/driver/rtc");
		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
};

export const getCpu = () => {
	return os.cpus()[0].model;
};

export const getDiskSize = () => {
	const root = "/sys/block";
	const stat = fs.readdirSync(root);
	return _.compact(
		_.map(stat, blkdev => {
			const majMin = fs.readFileSync(`${root}/${blkdev}/dev`, "utf8").trim();
			// ignore loopbacks and ramdisks, and only care about minor devices :0 (ze root)
			if (!majMin.endsWith(":0")) {
				return null;
			}
			if (majMin.startsWith("7:") || majMin.startsWith("1:")) {
				return null;
			}
			const size = ((fs.readFileSync(`${root}/${blkdev}/size`, "utf8") as unknown) as number) * 512;
			console.log(`blkdev: ${blkdev}, size: ${size}`);
			return size > 0 ? [`${blkdev.toUpperCase()}_SIZE_GB`, sanitizeSize(size)] : null;
		})
	);
};

export const getKernelRelease = () => {
	return os.release();
};

export const getTotalMem = () => {
	return sanitizeSize(os.totalmem());
};
