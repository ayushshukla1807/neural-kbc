#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>

/**
 * High-performance Matrix Operations Core for Neural KBC.
 * Optimized for low-latency similarity scoring of question embeddings.
 */

namespace NeuralCore {

    class MatrixEngine {
    public:
        // Calculate Cosine Similarity between two high-dimensional vectors
        static float cosine_similarity(const std::vector<float>& A, const std::vector<float>& B) {
            if (A.size() != B.size()) return 0.0f;

            double dot_product = 0.0, norm_a = 0.0, norm_b = 0.0;
            for (size_t i = 0; i < A.size(); ++i) {
                dot_product += A[i] * B[i];
                norm_a += A[i] * A[i];
                norm_b += B[i] * B[i];
            }

            if (norm_a == 0 || norm_b == 0) return 0.0f;
            return static_cast<float>(dot_product / (std::sqrt(norm_a) * std::sqrt(norm_b)));
        }

        // Apply Softmax activation across a score vector
        static std::vector<float> softmax(const std::vector<float>& input) {
            std::vector<float> output(input.size());
            float max_val = *std::max_element(input.begin(), input.end());
            float sum = 0.0f;

            for (size_t i = 0; i < input.size(); ++i) {
                output[i] = std::exp(input[i] - max_val);
                sum += output[i];
            }

            for (size_t i = 0; i < input.size(); ++i) {
                output[i] /= sum;
            }

            return output;
        }

        // Basic Matrix-Vector Multiplication for Weights
        static std::vector<float> mat_vec_mul(const std::vector<std::vector<float>>& matrix, const std::vector<float>& vec) {
            size_t rows = matrix.size();
            size_t cols = vec.size();
            std::vector<float> result(rows, 0.0f);

            for (size_t i = 0; i < rows; ++i) {
                for (size_t j = 0; j < cols; ++j) {
                    result[i] += matrix[i][j] * vec[j];
                }
            }
            return result;
        }
    };

}

int main() {
    // Basic Verification of the Matrix Core
    std::vector<float> v1 = {1.0, 2.0, 3.0};
    std::vector<float> v2 = {1.0, 2.0, 3.1};

    float sim = NeuralCore::MatrixEngine::cosine_similarity(v1, v2);
    std::cout << "[NeuralCore] Similarity Score: " << sim << std::endl;

    std::vector<float> logits = {1.0, 2.0, 5.0};
    std::vector<float> probs = NeuralCore::MatrixEngine::softmax(logits);
    
    std::cout << "[NeuralCore] Softmax Distributions: ";
    for(float p : probs) std::cout << p << " ";
    std::cout << std::endl;

    return 0;
}
