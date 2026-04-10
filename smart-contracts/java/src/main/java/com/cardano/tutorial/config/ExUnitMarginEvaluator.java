package com.cardano.tutorial.config;

import com.bloxbean.cardano.client.api.TransactionEvaluator;
import com.bloxbean.cardano.client.api.exception.ApiException;
import com.bloxbean.cardano.client.api.model.EvaluationResult;
import com.bloxbean.cardano.client.api.model.Result;
import com.bloxbean.cardano.client.api.model.Utxo;
import com.bloxbean.cardano.client.backend.api.TransactionService;
import com.bloxbean.cardano.client.plutus.spec.ExUnits;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigInteger;
import java.util.List;
import java.util.Set;

/**
 * A TransactionEvaluator that delegates to Blockfrost's TransactionService
 * and adds a percentage margin to all returned ExUnits.
 *
 * The Blockfrost off-chain evaluator can slightly underestimate CPU/mem budgets,
 * causing "overspending the budget" failures on-chain. This wrapper applies the
 * margin BEFORE the script integrity hash is computed, keeping the tx valid.
 */
public class ExUnitMarginEvaluator implements TransactionEvaluator {

    private static final Logger log = LoggerFactory.getLogger(ExUnitMarginEvaluator.class);

    private final TransactionService transactionService;
    private final int marginPercent;

    public ExUnitMarginEvaluator(TransactionService transactionService, int marginPercent) {
        this.transactionService = transactionService;
        this.marginPercent = marginPercent;
        log.info("ExUnitMarginEvaluator initialized with {}% margin", marginPercent);
    }

    @Override
    public Result<List<EvaluationResult>> evaluateTx(byte[] txBytes, Set<Utxo> inputUtxos) throws ApiException {
        log.info("evaluateTx(bytes, utxos) called — applying {}% margin", marginPercent);
        Result<List<EvaluationResult>> result = transactionService.evaluateTx(txBytes);
        if (result.isSuccessful() && result.getValue() != null) {
            applyMargin(result.getValue());
        }
        return result;
    }

    @Override
    public Result<List<EvaluationResult>> evaluateTx(byte[] txBytes) throws ApiException {
        log.info("evaluateTx(bytes) called — applying {}% margin", marginPercent);
        Result<List<EvaluationResult>> result = transactionService.evaluateTx(txBytes);
        if (result.isSuccessful() && result.getValue() != null) {
            applyMargin(result.getValue());
        }
        return result;
    }

    private void applyMargin(List<EvaluationResult> results) {
        BigInteger factor = BigInteger.valueOf(100 + marginPercent);
        BigInteger hundred = BigInteger.valueOf(100);
        for (EvaluationResult er : results) {
            ExUnits eu = er.getExUnits();
            if (eu != null) {
                log.info("ExUnits BEFORE margin: cpu={}, mem={}", eu.getSteps(), eu.getMem());
                eu.setSteps(eu.getSteps().multiply(factor).divide(hundred));
                eu.setMem(eu.getMem().multiply(factor).divide(hundred));
                log.info("ExUnits AFTER margin:  cpu={}, mem={}", eu.getSteps(), eu.getMem());
            }
        }
    }
}
