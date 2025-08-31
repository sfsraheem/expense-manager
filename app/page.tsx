import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <div className="flex justify-center items-center h-screen">
        <Button variant="outline" className="cursor-pointer hover:bg-slate-500">Click me</Button>
      </div>
    </div>
  );
}
