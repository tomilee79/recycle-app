import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Truck, Recycle, Clock, Fuel } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { collectionTasks } from "@/lib/mock-data";

export default function PerformancePanel() {
    const totalCollections = collectionTasks.filter(t => t.status === 'Completed').length;
    const totalWeight = collectionTasks.filter(t => t.status === 'Completed').reduce((sum, task) => sum + task.collectedWeight, 0) / 1000; // in tons
    const avgCollectionTime = 35; // mock data in minutes
    const fuelEfficiency = 6.2; // mock data in km/l

    const efficiencyData = [
        { day: "Mon", collections: 25 },
        { day: "Tue", collections: 32 },
        { day: "Wed", collections: 28 },
        { day: "Thu", collections: 41 },
        { day: "Fri", collections: 38 },
        { day: "Sat", collections: 52 },
        { day: "Sun", collections: 15 },
    ];

    const chartConfig = {
        collections: { label: "Collections", color: "hsl(var(--primary))" },
    };

    return (
        <div className="grid gap-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCollections}</div>
                        <p className="text-xs text-muted-foreground">+5 from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Weight (Tons)</CardTitle>
                        <Recycle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWeight.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+12% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Collection Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgCollectionTime} min</div>
                        <p className="text-xs text-muted-foreground">-2 min from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fuelEfficiency} km/L</div>
                        <p className="text-xs text-muted-foreground">+0.3 from last week</p>
                    </CardContent>
                </Card>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Weekly Collection Efficiency</CardTitle>
                    <CardDescription>Number of collections per day this week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={efficiencyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis 
                                  dataKey="day" 
                                  tickLine={false} 
                                  tickMargin={10} 
                                  axisLine={false} 
                                  stroke="#888888"
                                  fontSize={12}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="collections" fill="var(--color-collections)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
