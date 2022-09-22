import voucherService from "../../src/services/voucherService";
import voucherRepository from "../../src/repositories/voucherRepository";
import * as voucherFactory from "../factories/voucherFactory";
import * as errorUtils from "../../src/utils/errorUtils";

describe("Create voucher function", () => {
    it("Should create the voucher", async ()=> {
        const voucher = voucherFactory.createVoucherFactory();
        
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(null);

        jest.spyOn(voucherRepository, "createVoucher").mockResolvedValueOnce({
            ...voucher,
            id: 1,
            used: false,
        });

        await voucherService.createVoucher(voucher.code, voucher.discount);
    });

    it("Should trigger a conflict error with the voucher code to be created", async ()=> {
        const voucher = voucherFactory.createVoucherFactory();
        
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce({
            ...voucher,
            id: 1,
            used: false,
        });

        jest.spyOn(errorUtils, "conflictError").mockImplementationOnce(() => {
            const error: errorUtils.AppError = { type: "conflict", message: "Voucher already exist." }; 
            
            throw error;
        });

        await voucherService.createVoucher(voucher.code, voucher.discount);
    });
});

describe("Apply voucher function", () => {
    it("Should trigger a conflict error because the voucher does not exist", async () => {
        const voucher = voucherFactory.applyVoucherFactory(110);

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(null);

        jest.spyOn(errorUtils, "conflictError").mockImplementationOnce(() => {
            const error: errorUtils.AppError = { type: "conflict", message: "Voucher does not exist." }; 
            
            return error;
        });

        await voucherService.applyVoucher(voucher.code, voucher.amount);
    });

    it("Should use the voucher and apply the discount", async () => {
        const voucher = voucherFactory.applyVoucherFactory(150);
        const expectedDiscount = 50;
        const expectedFinalAmount = 75;
        const expectedApplied = true; 

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce({ id: 1, code: voucher.code, discount: 50, used: false });

        jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce({ id: 1, code: voucher.code, discount: 50, used: true });

        const {
            amount,
            discount,
            finalAmount,
            applied
          } = await voucherService.applyVoucher(voucher.code, voucher.amount);

        expect(amount).toEqual(voucher.amount);
        expect(discount).toEqual(expectedDiscount);
        expect(finalAmount).toEqual(expectedFinalAmount);
        expect(applied).toEqual(expectedApplied);
    });

    it("Should not use the voucher because it has already been used", async () => {
        const voucher = voucherFactory.applyVoucherFactory(150);
        const expectedDiscount = 50;
        const expectedFinalAmount = 150;
        const expectedApplied = false; 

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce({ id: 1, code: voucher.code, discount: 50, used: true });

        const {
            amount,
            discount,
            finalAmount,
            applied
          } = await voucherService.applyVoucher(voucher.code, voucher.amount);

        expect(amount).toEqual(voucher.amount);
        expect(discount).toEqual(expectedDiscount);
        expect(finalAmount).toEqual(expectedFinalAmount);
        expect(applied).toEqual(expectedApplied);
    });

    it("Should not use the voucher because the minimum purchase amount has not been reached", async () => {
        const voucher = voucherFactory.applyVoucherFactory(90);
        const expectedDiscount = 50;
        const expectedFinalAmount = 90;
        const expectedApplied = false; 

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce({ id: 1, code: voucher.code, discount: 50, used: false });

        const {
            amount,
            discount,
            finalAmount,
            applied
          } = await voucherService.applyVoucher(voucher.code, voucher.amount);

        expect(amount).toEqual(voucher.amount);
        expect(discount).toEqual(expectedDiscount);
        expect(finalAmount).toEqual(expectedFinalAmount);
        expect(applied).toEqual(expectedApplied);
    });

    it("must not use the voucher because the minimum purchase amount has not been reached and the voucher has already been used", async () => {
        const voucher = voucherFactory.applyVoucherFactory(90);
        const expectedDiscount = 50;
        const expectedFinalAmount = 90;
        const expectedApplied = false; 

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce({ id: 1, code: voucher.code, discount: 50, used: true });

        const {
            amount,
            discount,
            finalAmount,
            applied
          } = await voucherService.applyVoucher(voucher.code, voucher.amount);

        expect(amount).toEqual(voucher.amount);
        expect(discount).toEqual(expectedDiscount);
        expect(finalAmount).toEqual(expectedFinalAmount);
        expect(applied).toEqual(expectedApplied);
    });
});