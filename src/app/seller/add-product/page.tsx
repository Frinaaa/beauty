import ProductForm from "@/src/components/seller/ProductForm";

export default function AddProductPage() {
  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-light tracking-[2px] text-[#4A1523] mb-2">Add New Product</h1>
        <p className="text-[#4A1523]/70 font-light tracking-wide">
          List a new item in your luxury collection. See how it looks in real-time.
        </p>
      </header>
      
      <ProductForm />
    </div>
  );
}
