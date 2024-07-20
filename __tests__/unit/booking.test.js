const bookingController=require("../../controllers/booking")
const stripe=require('stripe');
const Tour=require("../../models/tour");

let req,res,next;

const tour={id:1,name:'tour',summary:'',imageCover:'',price:2,slug:"tour-tour"};
const session={id:1};

jest.mock("../../models/tour",()=>({
    findById:jest.fn()
}))
jest.mock('stripe',()=>()=>({
    checkout:{
        sessions:{
            create:jest.fn().mockResolvedValue(session)
        }
    }
}))
beforeEach(()=>{
    req = {
        params: {
            id: 1,
            tourId:1,
            userId:1
        },
        body:{},
        query:{},
        protocol:"https",
        get:jest.fn(),
        user:{
            email:"a@gmail.com"
        }

    }
    res = {
        status: jest.fn().mockReturnThis(),//return res
        json: jest.fn().mockReturnThis(),//return res
    }
    next = jest.fn();
    Tour.findById.mockReset();
})
describe('get checkout session',()=>{
    it('should return checkout session',async ()=>{
        Tour.findById.mockImplementationOnce(()=>Promise.resolve(tour))
        await bookingController.getCheckoutSession(req,res,next);
        expect(Tour.findById).toBeCalledWith(req.params.tourId);
        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            session,
            status:"success"
        });
    })
    it('should throw database error',async ()=>{
        const error=new Error('database error')
        Tour.findById.mockImplementationOnce(()=>Promise.reject(error))
        await bookingController.getCheckoutSession(req,res,next);
        expect(Tour.findById).toBeCalledWith(req.params.tourId);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toBeCalledWith(error);
    })
})