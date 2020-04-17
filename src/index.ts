import * as fs from "fs";
import * as os from "os";
import * as _ from "lodash";
import * as balena from "balena-sdk";

const sdk = balena.fromSharedOptions();
sdk.auth.loginWithToken(process.env.BALENA_API_KEY ?? "");

const BALENA_DEVICE_UUID = process.env.BALENA_DEVICE_UUID ?? "";

const getMacAddresses = () => {
	return _.compact(
		_.map(os.networkInterfaces(), (obj, iface) => {
			if (iface.startsWith("resin-")) {
				return null;
			}
			return obj[0].internal ? null : [iface, obj[0].mac];
		})
	);
};

const getCpu = () => {
	return os.cpus()[0].model;
};

const getDiskSize = () => {
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
			const size = (((fs.readFileSync(`${root}/${blkdev}/size`, "utf8") as unknown) as number) * 512) / 1024 ** 3;
			console.log(`blkdev: ${blkdev}, size: ${size}`);
			return size > 0 ? [`${blkdev.toUpperCase()}_SIZE_GB`, `${size}`] : null;
		})
	);
};

const setTag = async (key: string, val: string) => {
	console.log(`setting ${key} to ${val}...`);
	await sdk.models.device.tags.set(BALENA_DEVICE_UUID, key, val);
};

const getHardwareTags = async () => {
	const tags = [
		["CPU", getCpu()],
		["TOTAL_MEM_MB", `${os.totalmem() / 1024.0 ** 2}`],
		["KERNEL_RELEASE", os.release()],
		...getMacAddresses(),
		...getDiskSize()
	];
	_.forEach(tags, async item => {
		await setTag(item[0], item[1]);
	});
};

getHardwareTags();
