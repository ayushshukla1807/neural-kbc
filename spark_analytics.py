from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count, window, explode, from_json
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType, TimestampType
import matplotlib.pyplot as plt
import pandas as pd

# Initialize Spark Session for Neural-KBC Analytics
spark = SparkSession.builder \
    .appName("NeuralKBC_Gameplay_Analytics") \
    .master("local[*]") \
    .config("spark.memory.fraction", "0.8") \
    .getOption("spark.executor.memory", "4g") \
    .getOrCreate()

# Define schema for the incoming JSON logs from MongoDB/Postgres aggregation
game_log_schema = StructType([
    StructField("event_id", StringType(), True),
    StructField("user_id", StringType(), True),
    StructField("timestamp", TimestampType(), True),
    StructField("question_id", StringType(), True),
    StructField("predicted_difficulty", DoubleType(), True),
    StructField("lifeline_used", StringType(), True), # e.g., "expert_advice_genai", "50_50", "none"
    StructField("time_taken_seconds", IntegerType(), True),
    StructField("is_correct", IntegerType(), True), # 1 or 0
    StructField("cash_won", DoubleType(), True)
])

def run_analysis(log_path="s3a://neural-kbc-datalake/gameplay_logs/*.json"):
    print("🚀 Initializing Big Data Pipeline for User Gameplay Patterns...")
    
    # In a simulated environment, we might create a mock DataFrame if the path doesn't exist.
    # For demonstration, we'll assume the dataframe is loaded or map mock data.
    
    # df = spark.read.schema(game_log_schema).json(log_path)
    
    # MOCK DATA GENERATION FOR SIMULATION PURPOSES
    data = [
        ("evt1", "u1", "2026-03-01 12:00:00", "q1", 0.85, "none", 12, 1, 1000.0),
        ("evt2", "u2", "2026-03-01 12:05:00", "q2", 0.95, "expert_advice_genai", 25, 1, 5000.0),
        ("evt3", "u1", "2026-03-01 12:10:00", "q3", 0.99, "none", 5, 0, 0.0),
        ("evt4", "u3", "2026-03-02 14:00:00", "q1", 0.88, "50_50", 18, 1, 1000.0),
        ("evt5", "u4", "2026-03-02 15:30:00", "q4", 0.60, "none", 8, 1, 500.0),
        ("evt6", "u2", "2026-03-02 16:45:00", "q5", 0.92, "audience_poll", 22, 0, 0.0),
        # Assuming thousands more rows in a real cluster...
    ]
    df = spark.createDataFrame(data, ["event_id", "user_id", "timestamp", "question_id", "predicted_difficulty", "lifeline_used", "time_taken_seconds", "is_correct", "cash_won"])

    # 1. Average Time Taken vs Prediction Difficulty
    print("⚙️ Computing Time-to-Difficulty Correlation Matrix...")
    difficulty_stats = df.groupBy("predicted_difficulty") \
        .agg(
            avg("time_taken_seconds").alias("avg_time"),
            avg("is_correct").alias("win_rate")
        ).orderBy("predicted_difficulty")
    
    # 2. Lifeline Usage Distribution
    print("⚙️ Aggregating Lifeline Effectiveness...")
    lifeline_stats = df.groupBy("lifeline_used") \
        .agg(
            count("event_id").alias("total_uses"),
            avg("is_correct").alias("success_rate")
        ).orderBy(col("total_uses").desc())

    # 3. Cash Flow Timeline (Tumbling Window)
    # Using pandas conversion for Matplotlib Visualization
    print("📊 Converting Reducer outputs to Pandas for Visualization...")
    pdf_difficulty = difficulty_stats.toPandas()
    pdf_lifeline = lifeline_stats.toPandas()
    
    generate_visualizations(pdf_difficulty, pdf_lifeline)

def generate_visualizations(pdf_diff, pdf_life):
    """Generates charts to visualize the big data aggregation outcomes"""
    
    # Chart 1: Win Rate vs Predicted ML Difficulty
    plt.figure(figsize=(10, 5))
    plt.plot(pdf_diff['predicted_difficulty'], pdf_diff['win_rate'], marker='o', color='purple', linestyle='-')
    plt.title('Player Win Rate vs ML Predicted Question Difficulty')
    plt.xlabel('XGBoost Assigned Difficulty (0 to 1.0)')
    plt.ylabel('Win Rate (Expected Value)')
    plt.grid(True)
    plt.savefig('ml_difficulty_correlation.png')
    plt.close()
    print("✅ Generated: ml_difficulty_correlation.png")
    
    # Chart 2: Lifeline Effectiveness
    plt.figure(figsize=(10, 5))
    plt.bar(pdf_life['lifeline_used'], pdf_life['success_rate'], color=['blue', 'green', 'orange', 'red'])
    plt.title('Lifeline Success Propensity')
    plt.xlabel('Lifeline Type')
    plt.ylabel('Success Rate')
    plt.ylim(0, 1.0)
    plt.savefig('lifeline_effectiveness.png')
    plt.close()
    print("✅ Generated: lifeline_effectiveness.png")

if __name__ == "__main__":
    run_analysis()
    spark.stop()
    print("🎉 ETL Job Complete. Node shutting down.")
