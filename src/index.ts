import * as hw from "./hardware";
import * as _ from "lodash";
import * as balena from "balena-sdk";

const sdk = balena.fromSharedOptions();
sdk.auth.loginWithToken(process.env.BALENA_API_KEY ?? "");

const BALENA_DEVICE_UUID = process.env.BALENA_DEVICE_UUID ?? "";

const setTag = async (key: string, val: string) => {
	console.log(`setting ${key} to ${val}...`);
	await sdk.models.device.tags.set(BALENA_DEVICE_UUID, key, val);
};

const getHardwareTags = async () => {
	const tags = [
		...hw.getDiskSize(),
		...hw.getIntsWithMacAddresses(),
		["CPU", hw.getCpu()],
		hw.hasRTC() ? ["HAS_RTC", "true"] : [],
		["KERNEL_RELEASE", hw.getKernelRelease()],
		["TOTAL_MEM_GB", `${hw.getTotalMem()}`]
	];
	_.forEach(tags, async item => {
		await setTag(item[0], item[1]);
	});
};

getHardwareTags();
